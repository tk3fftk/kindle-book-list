/**
 * Kindle Book Extractor from Gmail
 * Extracts Kindle book titles from Amazon.co.jp order confirmation emails
 * It runs on Google Apps Script that relates to Gmail and Google Sheets
 */

/**
 * Main entry point for Google Apps Script execution
 * Execute this function to extract Kindle books from Gmail
 */
function main() {
  return extractKindleBooksFromGmail();
}

function getFromScriptProperties(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error(`Missing configuration for key: ${key}`);
  }
  return value;
}

function getFromScriptPropertiesOptional(key, defaultValue = "") {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  return value !== null && value !== undefined && value !== ""
    ? value
    : defaultValue;
}

// Configuration
const CONFIG = {
  // Search queries for Amazon emails
  SEARCH_QUERIES: [
    'from:no-reply@amazon.co.jp subject:"ご注文" Kindle',
    'from:order-update@amazon.co.jp subject:"ご注文" Kindle',
    'from:no-reply@amazon.co.jp subject:"ご注文" 電子書籍',
    "from:digital-no-reply@amazon.co.jp",
  ],

  // Date range (days back from today)
  DAYS_BACK: 30,

  // Processing options
  PROCESS_ONLY_UNREAD: false,
  MARK_AS_READ: false,

  // Spreadsheet settings
  SPREADSHEET_ID: getFromScriptProperties("SPREADSHEET_ID"),
  SHEET_ID: getFromScriptProperties("SHEET_ID"),

  // Obtain book author feature
  FETCH_AUTHOR:
    getFromScriptPropertiesOptional("FETCH_AUTHOR", "true") === "true",
  LLM_PROVIDER: getFromScriptPropertiesOptional("LLM_PROVIDER", "gemini"),
  LLM_API_URL: getFromScriptPropertiesOptional("LLM_API_URL", ""),
  LLM_API_KEY: getFromScriptProperties("LLM_API_KEY"),
  LLM_MODEL: getFromScriptProperties("LLM_MODEL"),
};

/**
 * Clean book title by removing Kindle/publisher tags, volume numbers, and excess spaces
 */
function cleanBookTitle(rawTitle) {
  if (!rawTitle) return "";
  let title = rawTitle;

  // 1. Remove bracketed tags like 【リフロー型】, 【電子限定...】, [Kindle...]
  title = title.replace(/[【\[][^】\]]*[】\]]/g, " ");

  // 2. Remove trailing label/format tags in parentheses, e.g., (角川コミックス・エース), (ジャンプコミックスDIGITAL), (Kindle版), （〇〇文庫）
  title = title.replace(
    /[\(（][^\)）]*(?:コミックス?|DIGITAL|digital|Kindle|版|文庫|単行本|新書|レーベル|マガジン|セレクション)[^\)）]*[\)）]/gi,
    " "
  );

  // 3. Remove trailing volume numbers, e.g., （７）, (4), 4, 第3巻, 12巻
  title = title.replace(/[\(（]\s*\d+\s*[\)）]\s*$/g, " ");
  title = title.replace(/\s+第?\d+巻?\s*$/g, " ");

  // 4. Normalize spaces
  title = title.replace(/[\s\u3000]+/g, " ").trim();

  return title || rawTitle.trim();
}

// Shared LLM prompt constants
const AUTHOR_FALLBACK = "To be update";

const LLM_SYSTEM_PROMPT =
  "あなたは書籍情報の専門家です。与えられた書籍タイトルから、その正確な著者名（原著者・漫画家・編者）のみを特定して出力してください。\n" +
  "- 余計な解説、挨拶、記号、マークダウン、出力フォーマットの説明は一切含めず、著者名のみを出力してください。\n" +
  "- 複数著者の場合はカンマ区切り（例: 著者1, 著者2）で出力してください。\n" +
  "- 確証が持てない場合や特定できない場合は、必ず「To be update」とだけ出力してください。";

function buildUserPrompt(cleanedTitle) {
  return `書籍タイトル: <booktitle>${cleanedTitle}</booktitle>\n著者名:`;
}

/**
 * Fetch author using Gemini native REST API with Google Search Grounding
 */
function fetchAuthorFromGemini(cleanedTitle, rawTitle) {
  try {
    const apiUrl =
      CONFIG.LLM_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.LLM_MODEL}:generateContent`;

    const payload = {
      contents: [
        {
          parts: [{ text: buildUserPrompt(cleanedTitle) }],
        },
      ],
      systemInstruction: {
        parts: [{ text: LLM_SYSTEM_PROMPT }],
      },
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.0,
      },
    };

    Logger.log(
      `🔍 [Gemini Search] Fetching author for: "${cleanedTitle}" (Raw: "${rawTitle}")`
    );

    const response = UrlFetchApp.fetch(apiUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": CONFIG.LLM_API_KEY,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      if (
        json.candidates &&
        json.candidates[0] &&
        json.candidates[0].content &&
        json.candidates[0].content.parts &&
        json.candidates[0].content.parts[0]
      ) {
        const author = json.candidates[0].content.parts[0].text.trim();
        Logger.log(`🖋️ [Gemini] Fetched author: ${author}`);
        return author;
      }
    }

    Logger.log(
      `⚠️ Gemini API error: ${response.getResponseCode()} - ${response.getContentText()}`
    );
    return AUTHOR_FALLBACK;
  } catch (error) {
    Logger.log(`⚠️ Gemini fetch error: ${error.message}`);
    return AUTHOR_FALLBACK;
  }
}

/**
 * Fetch author using OpenAI-compatible API
 */
function fetchAuthorFromOpenAI(cleanedTitle, rawTitle) {
  if (!CONFIG.LLM_API_URL) {
    Logger.log("⚠️ LLM_API_URL is required when LLM_PROVIDER is 'openai'");
    return AUTHOR_FALLBACK;
  }

  try {
    const payload = {
      model: CONFIG.LLM_MODEL,
      temperature: 0.0,
      messages: [
        { role: "system", content: LLM_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(cleanedTitle) },
      ],
    };

    Logger.log(
      `🔍 [OpenAI] Fetching author for: "${cleanedTitle}" (Raw: "${rawTitle}")`
    );

    const response = UrlFetchApp.fetch(CONFIG.LLM_API_URL, {
      method: "post",
      headers: {
        Authorization: `Bearer ${CONFIG.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      const author = json.choices[0].message.content.trim();
      Logger.log(`🖋️ [OpenAI] Fetched author: ${author}`);
      return author;
    } else {
      Logger.log(
        `⚠️ OpenAI API error: ${response.getResponseCode()} - ${response.getContentText()}`
      );
      return AUTHOR_FALLBACK;
    }
  } catch (error) {
    Logger.log(`⚠️ OpenAI fetch error: ${error.message}`);
    return AUTHOR_FALLBACK;
  }
}

/**
 * Main dispatcher to fetch author from LLM (Gemini / OpenAI)
 */
function fetchAuthorFromLLM(bookTitle) {
  if (!CONFIG.FETCH_AUTHOR) {
    return AUTHOR_FALLBACK;
  }

  const cleanedTitle = cleanBookTitle(bookTitle);

  if (CONFIG.LLM_PROVIDER === "openai") {
    return fetchAuthorFromOpenAI(cleanedTitle, bookTitle);
  } else {
    return fetchAuthorFromGemini(cleanedTitle, bookTitle);
  }
}

/**
 * Main function to extract Kindle books from Gmail
 */
function extractKindleBooksFromGmail() {
  const startTime = new Date();
  Logger.log("🚀 Starting Kindle book extraction from Gmail...");
  Logger.log(`📅 Search period: Past ${CONFIG.DAYS_BACK} days`);

  const result = {
    success: false,
    summary: {
      totalBooksFound: 0,
      uniqueBooks: 0,
      emailsProcessed: 0,
      duplicatesRemoved: 0,
      timeRange: `Past ${CONFIG.DAYS_BACK} days`,
      executionTime: 0,
    },
    books: [],
    csv: "",
    processedEmails: [],
    debugInfo: {
      searchQueries: CONFIG.SEARCH_QUERIES,
      errors: [],
      queryResults: {},
    },
  };

  try {
    const allBooks = [];

    // Search for emails using different queries
    Logger.log(
      `🔍 Processing ${CONFIG.SEARCH_QUERIES.length} search queries...`
    );

    for (let i = 0; i < CONFIG.SEARCH_QUERIES.length; i++) {
      const query = CONFIG.SEARCH_QUERIES[i];
      Logger.log(
        `\n📧 Query ${i + 1}/${CONFIG.SEARCH_QUERIES.length}: ${query}`
      );

      try {
        const queryResult = searchAndProcessEmails(query);
        allBooks.push(...queryResult.books);

        result.debugInfo.queryResults[query] = {
          booksFound: queryResult.books.length,
          threadsProcessed: queryResult.threadsProcessed,
          messagesProcessed: queryResult.messagesProcessed,
        };

        result.summary.emailsProcessed += queryResult.messagesProcessed;
        result.processedEmails.push(...queryResult.processedEmails);

        Logger.log(
          `✅ Query complete: ${queryResult.threadsProcessed} threads, ${queryResult.messagesProcessed} messages, ${queryResult.books.length} books`
        );
      } catch (queryError) {
        Logger.log(`❌ Query failed: ${queryError.message}`);
        result.debugInfo.errors.push(`Query "${query}": ${queryError.message}`);
      }
    }

    result.summary.totalBooksFound = allBooks.length;

    Logger.log(
      `\n📊 Total books found (including duplicates): ${allBooks.length}`
    );

    if (allBooks.length === 0) {
      Logger.log("ℹ️ No Kindle books found in recent emails");
      result.message = "No Kindle books found in recent emails";
      result.success = true;
      result.summary.executionTime = `${(new Date() - startTime) / 1000}s`;
      return result;
    }

    // Remove duplicates
    Logger.log("🔄 Removing duplicates...");
    const uniqueBooks = removeDuplicates(allBooks);
    result.summary.uniqueBooks = uniqueBooks.length;
    result.summary.duplicatesRemoved = allBooks.length - uniqueBooks.length;
    result.books = uniqueBooks;

    Logger.log(`🧹 Removed ${result.summary.duplicatesRemoved} duplicates`);
    Logger.log(`📚 Final unique books: ${uniqueBooks.length}`);

    // Log extracted books summary
    Logger.log("\n📖 Extracted Kindle Books:");
    uniqueBooks.forEach((book, index) => {
      Logger.log(
        `${index + 1}. "${book.title}" (${book.orderDate.toLocaleDateString()})`
      );
    });

    // Generate CSV
    result.csv = exportAsCSV(uniqueBooks);

    // Append to spreadsheet
    Logger.log("\n📊 Appending books to Google Spreadsheet...");
    const spreadsheetResult = appendToSpreadsheet(uniqueBooks);
    result.spreadsheet = spreadsheetResult;

    // Calculate execution time
    result.summary.executionTime = `${(new Date() - startTime) / 1000}s`;

    result.success = true;
    result.message = `Successfully extracted ${
      uniqueBooks.length
    } unique Kindle books${
      spreadsheetResult.success
        ? ` and added ${spreadsheetResult.booksAdded} to spreadsheet`
        : ` (spreadsheet update failed: ${spreadsheetResult.error})`
    }`;

    Logger.log(`\n✅ Extraction complete in ${result.summary.executionTime}`);

    return result;
  } catch (error) {
    result.debugInfo.errors.push(`Main execution error: ${error.message}`);
    result.message = `Error: ${error.message}`;
    result.summary.executionTime = `${(new Date() - startTime) / 1000}s`;
    return result;
  }
}

/**
 * Search Gmail and process emails with the given query
 */
function searchAndProcessEmails(query) {
  const books = [];
  const processedEmails = [];
  let threadsProcessed = 0;
  let messagesProcessed = 0;

  try {
    // Add date range to query if specified
    let searchQuery = query;
    if (CONFIG.DAYS_BACK > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - CONFIG.DAYS_BACK);
      const dateStr = Utilities.formatDate(
        startDate,
        Session.getScriptTimeZone(),
        "yyyy/MM/dd"
      );
      searchQuery += ` after:${dateStr}`;
    }

    // Add unread filter if specified
    if (CONFIG.PROCESS_ONLY_UNREAD) {
      searchQuery += " is:unread";
    }

    Logger.log(`🔎 Final search query: ${searchQuery}`);
    const threads = GmailApp.search(searchQuery, 0, 50); // Limit to 50 threads
    threadsProcessed = threads.length;

    Logger.log(`📧 Found ${threads.length} email threads`);

    if (threads.length === 0) {
      Logger.log("   No threads found for this query");
    }

    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const messages = thread.getMessages();

      Logger.log(
        `   Thread ${i + 1}/${threads.length}: ${messages.length} messages`
      );

      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        messagesProcessed++;

        const subject = message.getSubject();
        const date = message.getDate();

        Logger.log(
          `      Message ${j + 1}: "${subject}" (${date.toLocaleDateString()})`
        );

        const extractedBooks = parseAmazonEmail(message);
        books.push(...extractedBooks);

        processedEmails.push({
          subject: subject,
          date: date,
          booksExtracted: extractedBooks.length,
          bookTitles: extractedBooks.map((book) => book.title),
        });

        if (extractedBooks.length > 0) {
          Logger.log(
            `         📚 Extracted ${
              extractedBooks.length
            } books: ${extractedBooks.map((b) => `"${b.title}"`).join(", ")}`
          );
        } else {
          Logger.log(`         ⏭️ No Kindle books found in this message`);
        }

        // Mark as read if configured
        if (CONFIG.MARK_AS_READ) {
          message.markRead();
        }
      }
    }
  } catch (error) {
    throw new Error(
      `Error searching emails with query "${query}": ${error.message}`
    );
  }

  return {
    books: books,
    threadsProcessed: threadsProcessed,
    messagesProcessed: messagesProcessed,
    processedEmails: processedEmails,
  };
}

/**
 * Parse an Amazon email to extract Kindle book information
 */
function parseAmazonEmail(message) {
  const books = [];

  try {
    const subject = message.getSubject();
    const body = message.getBody();
    const rawContent = message.getRawContent();
    const date = message.getDate();

    // Try to extract from raw MIME content first (Base64 decoded)
    const decodedContent = extractFromRawMIME(rawContent);
    let kindleBooks = [];

    if (decodedContent) {
      kindleBooks = extractKindleBooks(decodedContent);
    }

    // If no books found from decoded content, try HTML parsing
    if (kindleBooks.length === 0) {
      kindleBooks = extractKindleBooks(body);
    }

    for (const book of kindleBooks) {
      books.push({
        title: book.title,
        orderDate: date,
        emailSubject: subject,
        format: "Kindle",
      });
    }
  } catch (error) {
    Logger.log(
      `         ⚠️ Error parsing email "${message.getSubject()}": ${
        error.message
      }`
    );
    return books;
  }

  return books;
}

/**
 * Extract plain text content from raw MIME email by decoding Base64 parts
 */
function extractFromRawMIME(rawContent) {
  try {
    // Look for text/plain parts with base64 encoding (improved boundary detection)
    const mimePartPattern =
      /Content-Type:\s*text\/plain[^]*?Content-Transfer-Encoding:\s*base64\s*[\r\n]+\s*([\s\S]*?)(?:[\r\n]+-+[=_]|$)/gi;
    let match = mimePartPattern.exec(rawContent);

    if (match && match[1]) {
      // Clean up the base64 content (remove line breaks and whitespace)
      const base64Content = match[1].replace(/[\r\n\s]/g, "");

      if (base64Content.length > 100) {
        try {
          // Decode Base64 content
          const decodedBytes = Utilities.base64Decode(base64Content);
          const decodedText =
            Utilities.newBlob(decodedBytes).getDataAsString("utf-8");

          Logger.log(
            `         ✅ Successfully decoded Base64 content (${decodedText.length} chars)`
          );
          return decodedText;
        } catch (decodeError) {
          Logger.log(`         ⚠️ Base64 decode error: ${decodeError.message}`);
        }
      }
    }

    // Fallback: try to find all base64 encoded sections
    const allBase64Matches = [
      ...rawContent.matchAll(
        /Content-Transfer-Encoding:\s*base64\s*[\r\n]+\s*([\s\S]*?)(?:[\r\n]+-+[=_]|$)/gi
      ),
    ];

    for (let i = 0; i < allBase64Matches.length; i++) {
      const base64Content = allBase64Matches[i][1].replace(/[\r\n\s]/g, "");
      if (base64Content.length > 100) {
        // Only try substantial content
        try {
          const decodedBytes = Utilities.base64Decode(base64Content);
          const decodedText =
            Utilities.newBlob(decodedBytes).getDataAsString("utf-8");

          if (
            decodedText.includes("Amazon") ||
            decodedText.includes("Kindle") ||
            decodedText.includes("注文") ||
            decodedText.includes("My alt")
          ) {
            Logger.log(
              `         ✅ Found Amazon content in Base64 part ${i} (${decodedText.length} chars)`
            );
            return decodedText;
          }
        } catch (decodeError) {
          continue; // Try next part
        }
      }
    }
  } catch (error) {
    Logger.log(`         ⚠️ MIME parsing error: ${error.message}`);
  }

  return null;
}

/**
 * Extract Kindle book information from email body
 */
function extractKindleBooks(body) {
  // Extract from plain text (Base64 decoded content)
  return extractFromPlainText(body);
}

/**
 * Extract books from plain text content (Base64 decoded)
 */
function extractFromPlainText(body) {
  const books = [];

  try {
    const lines = body.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for "My alt" pattern
      if (line.startsWith("My alt (")) {
        // The book title should be 2 lines after "My alt"
        // Structure: "My alt (URL)", empty line, book title
        const titleIndex = i + 2;

        if (titleIndex < lines.length) {
          const title = lines[titleIndex].trim();

          // Ensure it's not empty and not a seller line
          if (title && !title.startsWith("販売者")) {
            // Simple duplicate check
            if (
              !books.some(
                (book) => book.title.toLowerCase() === title.toLowerCase()
              )
            ) {
              Logger.log(`         📖 Plain text extraction: "${title}"`);
              books.push({
                title: title,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    Logger.log(`Plain text extraction error: ${error.message}`);
  }

  return books;
}

/**
 * Remove duplicate books based on title
 */
function removeDuplicates(books) {
  const seen = new Set();
  const uniqueBooks = [];

  for (const book of books) {
    const key = book.title.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      uniqueBooks.push(book);
    }
  }

  return uniqueBooks;
}

/**
 * Append books to Google Spreadsheet
 */
function appendToSpreadsheet(books) {
  if (!books || books.length === 0) {
    Logger.log("📊 No books to append to spreadsheet");
    return { success: true, booksAdded: 0 };
  }

  try {
    Logger.log(`📊 Appending ${books.length} books to spreadsheet...`);

    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetById(CONFIG.SHEET_ID);

    if (!sheet) {
      throw new Error(`Sheet with ID ${CONFIG.SHEET_ID} not found`);
    }

    // Prepare data rows: [Title, Author, Format]
    const rows = books.map((book) => {
      const author = fetchAuthorFromLLM(book.title);
      return [book.title, author, "Kindle"];
    });

    // Append to sheet
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);

    Logger.log(`✅ Successfully appended ${books.length} books to spreadsheet`);
    return { success: true, booksAdded: books.length };
  } catch (error) {
    Logger.log(`❌ Error appending to spreadsheet: ${error.message}`);
    return { success: false, error: error.message, booksAdded: 0 };
  }
}

/**
 * Export books data as CSV string
 */
function exportAsCSV(books) {
  if (!books || books.length === 0) {
    return "Title,Format\n";
  }

  const csvRows = ["Title,Format"]; // Simple headers

  for (const book of books) {
    const row = [
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.format}"`,
    ].join(",");
    csvRows.push(row);
  }

  return csvRows.join("\n");
}
