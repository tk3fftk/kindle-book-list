// Kindle Book Collector - Multi-page friendly script

// Helper function to sanitize text for CSV export
function sanitizeForCSV(text) {
  return text
    .replace(/,/g, "，") // Replace commas with full-width commas
    .replace(/"/g, '\\"'); // Escape double quotes with backslash
}

// Initialize the collector (run once)
window.initializeKindleCollector = function () {
  if (!window.kb) window.kb = [];

  // Collect books from current page
  window.collectBooks = function () {
    const books = [];
    document
      .querySelectorAll("table tr.ListItem-module_row__3orql")
      .forEach((row) => {
        // Extract title from the heading element
        const titleElement = row.querySelector(
          'div[role="heading"][aria-level="4"]'
        );
        const title = titleElement ? titleElement.textContent.trim() : "";

        // Extract author using the content-author ID pattern
        const authorElement = row.querySelector('div[id^="content-author-"]');
        const author = authorElement ? authorElement.textContent.trim() : "";

        if (title) {
          books.push({
            title: sanitizeForCSV(title),
            author: sanitizeForCSV(author),
            format: "Kindle",
          });
          console.log(`📖 ${title} by ${author}`);
        }
      });

    window.kb.push(...books);
    console.log(
      `✅ Added ${books.length} books from this page. Total: ${window.kb.length}`
    );
    return books.length;
  };

  // Page navigation helpers
  window.findNextPageButton = function () {
    // Find current active page
    const activePage = document.querySelector(".page-item.active");
    let nextButton = null;
    let currentPageNum = null;
    let nextPageNum = null;

    if (activePage) {
      // Get current page number from ID (e.g., "page-2" -> 2)
      currentPageNum = parseInt(activePage.id.replace("page-", ""));
      nextPageNum = currentPageNum + 1;

      // Try to find next numbered page
      nextButton = document.querySelector(`#page-${nextPageNum}`);
    }

    return { nextButton, currentPageNum, nextPageNum };
  };

  window.nextPage = function () {
    const { nextButton, currentPageNum, nextPageNum } =
      window.findNextPageButton();

    if (currentPageNum && nextPageNum) {
      console.log(
        `🔄 Moving from page ${currentPageNum} to page ${nextPageNum}...`
      );
    }

    if (nextButton) {
      nextButton.click();
      console.log("🔄 Navigating to next page...");
      console.log("💡 Wait for page to load, then run: collectBooks()");
    } else {
      console.log("ℹ️ No next page found - collection complete!");
      window.showResults();
    }
  };

  window.collectAllPages = function (options = {}) {
    const { mergeSequels = false } = options;

    console.log("🚀 Starting automated collection...");
    if (mergeSequels) {
      console.log("🔗 Auto-merge sequels enabled");
    }

    function collectAndNavigate() {
      setTimeout(() => {
        const count = window.collectBooks();
        if (count > 0) {
          setTimeout(() => {
            const { nextButton } = window.findNextPageButton();

            if (nextButton) {
              nextButton.click();
              console.log("🔄 Auto-navigating to next page...");
              setTimeout(collectAndNavigate, 5000); // Wait 5 seconds for page load
            } else {
              finishCollection();
            }
          }, 1000);
        } else {
          finishCollection();
        }
      }, 1000);
    }

    function finishCollection() {
      window.showResults();
      if (mergeSequels) {
        console.log("🔗 Auto-merging sequels...");
        setTimeout(() => {
          window.mergeSequels();
          window.showMerged();
        }, 1000);
      }
    }

    collectAndNavigate();
  };

  window.showResults = function () {
    console.log(`
  ${"🎉".repeat(20)}
  📚 Collection complete! Total books: ${window.kb.length}
  💾 Use downloadCSV() or copyCSV() to export data
  🔗 Use mergeSequels() to combine sequel series
  ${"🎉".repeat(20)}`);
  };

  // Help function to show all available commands
  window.help = function () {
    console.log(`🚀 Kindle Book Collector - Available Commands:

  📚 Collection Commands:
  📖 collectBooks()       - Collect books from current page
  🤖 collectAllPages()    - Auto-collect from all pages
  🔗 collectAllPages({mergeSequels: true}) - Auto-collect and merge
  📊 showResults()        - Show collection summary

  🧭 Navigation Commands:
  ➡️ nextPage()           - Navigate to next page

  📝 Sequel Merging Commands:
  🔗 mergeSequels()       - Merge sequel series into ranges
  📚 showMerged()         - Show merged collection summary

  💾 Export Commands:
  💾 downloadCSV()        - Download original CSV file
  📁 downloadMergedCSV()  - Download merged CSV file
  📋 copyCSV()            - Copy original CSV to clipboard
  📋 copyMergedCSV()      - Copy merged CSV to clipboard
  📄 toCSV()              - Get original CSV data as string
  📄 toMergedCSV()        - Get merged CSV data as string

  🔧 Utility Commands:
  ❓ help()               - Show this help message
  🔄 initializeKindleCollector() - Re-initialize if needed

  📊 Current Status: ${window.kb ? window.kb.length : 0} books collected`);
    if (window.kbMerged) {
      console.log(
        `📊 Merged Status: ${window.kbMerged.length} entries available`
      );
    }
  };

  console.log("🚀 Kindle Collector initialized!");
  window.help();
};

// Initialize and collect from first page
if (!window.kb) {
  window.initializeKindleCollector();
}

// Helper function to convert full-width digits and Japanese numerals to Arabic numerals
window.convertToHalfWidthNumber = function (text) {
  // Handle mixed text that might contain full-width digits, Japanese numerals, or ASCII digits
  let numericText = text;

  // Convert full-width digits (０-９) to ASCII digits (0-9)
  numericText = numericText.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xff10 + 0x30)
  );

  // Handle Japanese numerals
  const japaneseNumerals = {
    一: "1",
    二: "2",
    三: "3",
    四: "4",
    五: "5",
    六: "6",
    七: "7",
    八: "8",
    九: "9",
    十: "10",
  };

  // If it's a single Japanese numeral, convert it
  if (japaneseNumerals[numericText]) {
    numericText = japaneseNumerals[numericText];
  }

  // Parse as integer
  const result = parseInt(numericText);

  return {
    value: result,
    originalText: text,
    normalizedText: result.toString(),
  };
};

// Sequel Pattern Recognition Functions
window.sequelPatterns = {
  // Pattern 1: Numbered volumes in parentheses (1), (2), （１）, （２）, etc.
  numberedVolumes: {
    regex: /^(.+?)[\(（]([\d０-９]+)[\)）](.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeInfo = window.convertToHalfWidthNumber(match[2]);

        return {
          baseTitle: match[1].trim(),
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: match[3].trim(),
          type: "numbered",
        };
      }
      return null;
    },
  },

  // Pattern 2: Upper/Lower divisions (上/下)
  upperLower: {
    regex: /^(.+?)\s*([上下])\s*(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        return {
          baseTitle: match[1].trim(),
          volume: match[2] === "上" ? 1 : 2,
          volumeText: match[2],
          suffix: match[3].trim(),
          type: "upperLower",
        };
      }
      return null;
    },
  },

  // Pattern 3: Chapter format 【第X話】
  chapterFormat: {
    regex: /^(.+?)【第([\d０-９]+)話】(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeInfo = window.convertToHalfWidthNumber(match[2]);

        return {
          baseTitle: match[1].trim(),
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: match[3].trim(),
          type: "chapter",
        };
      }
      return null;
    },
  },

  // Pattern 4: Collection format 第X集
  collectionFormat: {
    regex: /^(.+?)第?([一二三四五六七八九十\d０-９]+)集(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeInfo = window.convertToHalfWidthNumber(match[2]);

        return {
          baseTitle: match[1].trim(),
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: match[3].trim(),
          type: "collection",
        };
      }
      return null;
    },
  },

  // Pattern 5: Volume format N巻
  volumeKan: {
    regex: /^(.+?)([\d０-９]+)巻(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeInfo = window.convertToHalfWidthNumber(match[2]);

        return {
          baseTitle: match[1].trim(),
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: match[3].trim(),
          type: "volumeKan",
        };
      }
      return null;
    },
  },

  // Pattern 6: Space + number format (Title1, Title 2, Title　3)
  spaceNumber: {
    regex: /^(.+?)[\s　]?([\d０-９]+)\s+\((.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeInfo = window.convertToHalfWidthNumber(match[2]);

        return {
          baseTitle: match[1].trim(),
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: `(${match[3]}`,
          type: "spaceNumber",
        };
      }
      return null;
    },
  },

  // Pattern 7: Title ending with number (Title1, Title2)
  titleEndingNumber: {
    regex: /^(.+?)([０-９\d]+)$/,
    extract: function (title) {
      // Avoid conflicts with other patterns - check if title contains specific markers
      if (
        title.includes("巻") ||
        title.includes("話") ||
        title.includes("集") ||
        title.includes("(") ||
        title.includes("（") ||
        title.includes("上") ||
        title.includes("下") ||
        title.includes("【") ||
        title.includes("第")
      ) {
        return null; // Let other patterns handle these
      }

      const match = title.match(this.regex);
      if (match) {
        const baseTitle = match[1].trim();
        // Make sure baseTitle is not empty and doesn't end with a digit
        if (!baseTitle || /[０-９\d]$/.test(baseTitle)) {
          return null;
        }

        const volumeInfo = window.convertToHalfWidthNumber(match[2]);

        return {
          baseTitle: baseTitle,
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: "",
          type: "titleEndingNumber",
        };
      }
      return null;
    },
  },

  // Pattern 8: Prefix collection format (1集 Title, 2集 Title)
  prefixCollection: {
    regex: /^([０-９\d一二三四五六七八九十]+)集\s+(.+)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeInfo = window.convertToHalfWidthNumber(match[1]);

        return {
          baseTitle: match[2].trim(),
          volume: volumeInfo.value,
          volumeText: volumeInfo.normalizedText,
          suffix: "",
          type: "prefixCollection",
        };
      }
      return null;
    },
  },
};

// Function to detect and extract sequel information from a title
window.extractSequelInfo = function (title) {
  for (const [patternName, pattern] of Object.entries(window.sequelPatterns)) {
    const result = pattern.extract(title);
    if (result) {
      result.pattern = patternName;
      return result;
    }
  }
  return null; // No sequel pattern detected
};

// Helper function to normalize author names for better grouping
window.normalizeAuthor = function (author) {
  if (!author) return "";

  // Remove extra spaces and common separators
  let normalized = author.trim();

  // Handle cases like "がちょん次郎， 六代目" -> "がちょん次郎"
  // Extract the main author before common separators
  const mainAuthorMatch = normalized.match(/^([^，,、]+)/);
  if (mainAuthorMatch) {
    return mainAuthorMatch[1].trim();
  }

  return normalized;
};

// Function to group books by series (author + base title)
window.groupBooksBySeries = function (books) {
  const series = {};
  const standalone = [];

  books.forEach((book) => {
    const sequelInfo = window.extractSequelInfo(book.title);

    if (sequelInfo) {
      // This is part of a series - use pattern-agnostic key
      const normalizedAuthor = window.normalizeAuthor(book.author);
      const seriesKey = `${normalizedAuthor}::${sequelInfo.baseTitle}`;

      if (!series[seriesKey]) {
        series[seriesKey] = {
          author: book.author, // Keep original author for first entry
          normalizedAuthor: normalizedAuthor,
          baseTitle: sequelInfo.baseTitle,
          types: new Set([sequelInfo.type]), // Track all pattern types used
          volumes: [],
          suffix: sequelInfo.suffix, // Keep suffix from first volume
        };
      } else {
        // Add this pattern type to the set
        series[seriesKey].types.add(sequelInfo.type);

        // Update author if the new one is more complete
        if (book.author.length > series[seriesKey].author.length) {
          series[seriesKey].author = book.author;
        }
      }

      series[seriesKey].volumes.push({
        volume: sequelInfo.volume,
        volumeText: sequelInfo.volumeText || sequelInfo.volume.toString(),
        originalTitle: book.title,
        format: book.format,
        patternType: sequelInfo.type,
      });
    } else {
      // Standalone book
      standalone.push(book);
    }
  });

  // Sort volumes within each series and detect mixed patterns
  Object.values(series).forEach((serie) => {
    serie.volumes.sort((a, b) => a.volume - b.volume);

    // Log series with mixed pattern types for debugging
    if (serie.types.size > 1) {
      console.log(
        `🔗 Mixed patterns detected for "${serie.baseTitle}" by ${
          serie.author
        }: ${Array.from(serie.types).join(", ")}`
      );
    }
  });

  return { series, standalone };
};

// Function to format volume ranges (consecutive vs non-consecutive)
window.formatVolumeRange = function (volumes, type) {
  if (volumes.length === 0) return "";
  if (volumes.length === 1) return volumes[0].volumeText;

  const volumeNumbers = volumes.map((v) => v.volume);

  // Special handling for upperLower type
  if (type === "upperLower") {
    const hasUpper = volumes.some((v) => v.volume === 1);
    const hasLower = volumes.some((v) => v.volume === 2);
    if (hasUpper && hasLower) {
      return "(上・下)";
    } else if (hasUpper) {
      return "上";
    } else {
      return "下";
    }
  }

  // For other types, check if consecutive
  const isConsecutive = volumeNumbers.every((num, index) => {
    if (index === 0) return true;
    return num === volumeNumbers[index - 1] + 1;
  });

  const min = Math.min(...volumeNumbers);
  const max = Math.max(...volumeNumbers);

  if (isConsecutive && volumeNumbers.length > 2) {
    // Consecutive range: (1-21)
    switch (type) {
      case "numbered":
        return `(${min}-${max})`;
      case "chapter":
        return `【第${min}-${max}話】`;
      case "collection":
        return `第${min}-${max}集`;
      case "prefixCollection":
        return `(${min}-${max})集`;
      case "volumeKan":
        return `(${min}-${max})巻`;
      case "spaceNumber":
        return `(${min}-${max})`;
      case "titleEndingNumber":
        return `(${min}-${max})`;
      default:
        return `(${min}-${max})`;
    }
  } else {
    // Non-consecutive or short list: (1,3,5) or (1,2)
    const volumeTexts = volumes.map((v) => v.volumeText).join(",");
    switch (type) {
      case "numbered":
        return `(${volumeTexts})`;
      case "chapter":
        return `【第${volumeTexts}話】`;
      case "collection":
        return `第${volumeTexts}集`;
      case "prefixCollection":
        return `(${volumeTexts})集`;
      case "volumeKan":
        return `(${volumeTexts})巻`;
      case "spaceNumber":
        return `(${volumeTexts})`;
      case "titleEndingNumber":
        return `(${volumeTexts})`;
      default:
        return `(${volumeTexts})`;
    }
  }
};

// Main function to merge sequels in the book collection
window.mergeSequels = function () {
  if (!window.kb || window.kb.length === 0) {
    console.log("❌ No books to merge. Collect some books first!");
    return;
  }

  console.log(`🔄 Merging sequels from ${window.kb.length} books...`);

  const { series, standalone } = window.groupBooksBySeries(window.kb);
  const mergedBooks = [];

  // Add merged series
  Object.values(series).forEach((serie) => {
    if (serie.volumes.length > 1) {
      // Multiple volumes - merge them
      // For mixed pattern types, use the most common pattern for formatting
      const patternCounts = {};
      serie.volumes.forEach((vol) => {
        patternCounts[vol.patternType] =
          (patternCounts[vol.patternType] || 0) + 1;
      });

      // Find the most common pattern type
      const dominantType = Object.keys(patternCounts).reduce((a, b) =>
        patternCounts[a] > patternCounts[b] ? a : b
      );

      const volumeRange = window.formatVolumeRange(serie.volumes, dominantType);
      let mergedTitle;

      if (dominantType === "upperLower" && volumeRange === "(上・下)") {
        mergedTitle = `${serie.baseTitle}${volumeRange}`;
      } else {
        mergedTitle = `${serie.baseTitle}${volumeRange}`;
      }

      if (serie.suffix) {
        mergedTitle += ` ${serie.suffix}`;
      }

      mergedBooks.push({
        title: mergedTitle,
        author: serie.author,
        format: serie.volumes[0].format,
        volumeCount: serie.volumes.length,
        originalTitles: serie.volumes.map((v) => v.originalTitle),
        mixedPatterns: serie.types.size > 1,
        patternTypes: Array.from(serie.types),
      });

      const patternInfo =
        serie.types.size > 1
          ? ` [Mixed: ${Array.from(serie.types).join(",")}]`
          : "";
      console.log(
        `📚 Merged: ${serie.baseTitle} (${serie.volumes.length} volumes)${patternInfo} -> ${mergedTitle}`
      );
    } else {
      // Single volume series (shouldn't happen, but handle gracefully)
      const volume = serie.volumes[0];
      mergedBooks.push({
        title: volume.originalTitle,
        author: serie.author,
        format: volume.format,
      });
    }
  });

  // Add standalone books unchanged
  standalone.forEach((book) => {
    mergedBooks.push(book);
  });

  // Store merged data
  window.kbMerged = mergedBooks;

  console.log(`✅ Merge complete!
📊 Original: ${window.kb.length} books
📊 Merged: ${mergedBooks.length} entries
📊 Series merged: ${Object.keys(series).length}
📊 Standalone books: ${standalone.length}
🔗 Mixed pattern series: ${mergedBooks.filter((b) => b.mixedPatterns).length}
💾 Use downloadMergedCSV() to download merged CSV`);

  return mergedBooks;
};

// Function to show merged results
window.showMerged = function () {
  if (!window.kbMerged) {
    console.log("❌ No merged data available. Run mergeSequels() first!");
    return;
  }

  console.log("\n" + "📚".repeat(20));
  console.log(
    `📊 Merged Collection Summary (${window.kbMerged.length} entries)`
  );
  console.log("📚".repeat(20));

  const seriesEntries = window.kbMerged.filter((book) => book.volumeCount);
  const standaloneEntries = window.kbMerged.filter((book) => !book.volumeCount);

  if (seriesEntries.length > 0) {
    console.log(`\n📖 Series (${seriesEntries.length} entries):`);
    seriesEntries.forEach((entry) => {
      console.log(
        `  📚 ${entry.title} by ${entry.author} (${entry.volumeCount} volumes)`
      );
    });
  }

  if (standaloneEntries.length > 0) {
    console.log(`\n📕 Standalone books (${standaloneEntries.length} entries):`);
    standaloneEntries.slice(0, 10).forEach((entry) => {
      console.log(`  📕 ${entry.title} by ${entry.author}`);
    });
    if (standaloneEntries.length > 10) {
      console.log(
        `  ... and ${standaloneEntries.length - 10} more standalone books`
      );
    }
  }

  console.log(`\n💾 Export options:`);
  console.log(`📁 Download merged CSV: downloadMergedCSV()`);
  console.log(`📋 Copy merged CSV: copyMergedCSV()`);
};

// Export functions for merged data
window.toMergedCSV = function () {
  if (!window.kbMerged) {
    console.log("❌ No merged data available. Run mergeSequels() first!");
    return "";
  }

  const header = "Title,Author,Format\n";
  const rows = window.kbMerged
    .map((book) => `"${book.title}","${book.author}","${book.format}"`)
    .join("\n");
  return header + rows;
};

window.downloadMergedCSV = function () {
  const csv = window.toMergedCSV();
  if (!csv) return;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().split("T")[0];
  link.download = `kindle_books_merged_${timestamp}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  console.log(`📁 Downloaded merged CSV: kindle_books_merged_${timestamp}.csv`);
};

window.copyMergedCSV = async function () {
  const csv = window.toMergedCSV();
  if (!csv) return;

  try {
    await navigator.clipboard.writeText(csv);
    console.log(
      `📋 Merged CSV copied to clipboard! (${window.kbMerged.length} entries)`
    );
  } catch (err) {
    console.log(`❌ Failed to copy to clipboard: ${err.message}`);
    console.log(`💡 Manual copy: Select and copy the CSV data below:`);
    console.log(csv);
  }
};

// CSV Export Functions
window.toCSV = function () {
  const header = "Title,Author,Format\n";
  const rows = window.kb
    .map((book) => `"${book.title}","${book.author}","${book.format}"`)
    .join("\n");
  return header + rows;
};

window.downloadCSV = function () {
  const csv = window.toCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().split("T")[0];
  link.download = `kindle_books_${timestamp}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  console.log(`📁 Downloaded CSV file: kindle_books_${timestamp}.csv`);
};

window.copyCSV = async function () {
  const csv = window.toCSV();
  try {
    await navigator.clipboard.writeText(csv);
    console.log(`📋 CSV data copied to clipboard! (${window.kb.length} books)`);
  } catch (err) {
    console.log(`❌ Failed to copy to clipboard: ${err.message}`);
    console.log(`💡 Manual copy: Select and copy the CSV data below:`);
    console.log(csv);
  }
};

// Show export options
if (window.kb.length > 0) {
  console.log(`
${"=".repeat(50)}
📚 ${window.kb.length} books collected. Export options:
💾 Download file: downloadCSV()
📋 Copy to clipboard: copyCSV()
➡️ Navigate to next page: nextPage()
🔗 Merge sequels: mergeSequels()
${"=".repeat(50)}`);
}
