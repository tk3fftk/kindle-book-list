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
    console.log("\n" + "🎉".repeat(20));
    console.log(`📚 Collection complete! Total books: ${window.kb.length}`);
    console.log("💾 Use downloadCSV() or copyCSV() to export data");
    console.log("🔗 Use mergeSequels() to combine sequel series");
    console.log("🎉".repeat(20));
  };

  // Help function to show all available commands
  window.help = function () {
    console.log("🚀 Kindle Book Collector - Available Commands:");
    console.log("\n📚 Collection Commands:");
    console.log("📖 collectBooks()       - Collect books from current page");
    console.log("🤖 collectAllPages()    - Auto-collect from all pages");
    console.log(
      "🔗 collectAllPages({mergeSequels: true}) - Auto-collect and merge"
    );
    console.log("📊 showResults()        - Show collection summary");

    console.log("\n🧭 Navigation Commands:");
    console.log("➡️ nextPage()           - Navigate to next page");

    console.log("\n📝 Sequel Merging Commands:");
    console.log("🔗 mergeSequels()       - Merge sequel series into ranges");
    console.log("📚 showMerged()         - Show merged collection summary");

    console.log("\n💾 Export Commands:");
    console.log("💾 downloadCSV()        - Download original CSV file");
    console.log("📁 exportMerged()       - Download merged CSV file");
    console.log("📋 copyCSV()            - Copy original CSV to clipboard");
    console.log("📋 copyMergedCSV()      - Copy merged CSV to clipboard");
    console.log("📄 toCSV()              - Get original CSV data as string");
    console.log("📄 toMergedCSV()        - Get merged CSV data as string");

    console.log("\n🔧 Utility Commands:");
    console.log("❓ help()               - Show this help message");
    console.log("🔄 initializeKindleCollector() - Re-initialize if needed");
    console.log("🧪 testSequelMerging()  - Test merging with sample data");

    console.log(
      `\n📊 Current Status: ${window.kb ? window.kb.length : 0} books collected`
    );
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

// Sequel Pattern Recognition Functions
window.sequelPatterns = {
  // Pattern 1: Numbered volumes in parentheses (1), (2), etc.
  numberedVolumes: {
    regex: /^(.+?)\((\d+)\)(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        return {
          baseTitle: match[1].trim(),
          volume: parseInt(match[2]),
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
    regex: /^(.+?)【第(\d+)話】(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        return {
          baseTitle: match[1].trim(),
          volume: parseInt(match[2]),
          suffix: match[3].trim(),
          type: "chapter",
        };
      }
      return null;
    },
  },

  // Pattern 4: Collection format 第X集
  collectionFormat: {
    regex: /^(.+?)第([一二三四五六七八九十\d]+)集(.*)$/,
    extract: function (title) {
      const match = title.match(this.regex);
      if (match) {
        const volumeText = match[2];
        let volume;

        // Convert Japanese numerals to numbers
        const japaneseNumerals = {
          一: 1,
          二: 2,
          三: 3,
          四: 4,
          五: 5,
          六: 6,
          七: 7,
          八: 8,
          九: 9,
          十: 10,
        };

        if (/^\d+$/.test(volumeText)) {
          volume = parseInt(volumeText);
        } else if (japaneseNumerals[volumeText]) {
          volume = japaneseNumerals[volumeText];
        } else {
          volume = 1; // Default fallback
        }

        return {
          baseTitle: match[1].trim(),
          volume: volume,
          volumeText: volumeText,
          suffix: match[3].trim(),
          type: "collection",
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

// Function to group books by series (author + base title)
window.groupBooksBySeries = function (books) {
  const series = {};
  const standalone = [];

  books.forEach((book) => {
    const sequelInfo = window.extractSequelInfo(book.title);

    if (sequelInfo) {
      // This is part of a series
      const seriesKey = `${book.author}::${sequelInfo.baseTitle}::${sequelInfo.type}`;

      if (!series[seriesKey]) {
        series[seriesKey] = {
          author: book.author,
          baseTitle: sequelInfo.baseTitle,
          type: sequelInfo.type,
          volumes: [],
          suffix: sequelInfo.suffix, // Keep suffix from first volume
        };
      }

      series[seriesKey].volumes.push({
        volume: sequelInfo.volume,
        volumeText: sequelInfo.volumeText || sequelInfo.volume.toString(),
        originalTitle: book.title,
        format: book.format,
      });
    } else {
      // Standalone book
      standalone.push(book);
    }
  });

  // Sort volumes within each series
  Object.values(series).forEach((serie) => {
    serie.volumes.sort((a, b) => a.volume - b.volume);
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
      const volumeRange = window.formatVolumeRange(serie.volumes, serie.type);
      let mergedTitle;

      if (serie.type === "upperLower" && volumeRange === "(上・下)") {
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
      });

      console.log(
        `📚 Merged: ${serie.baseTitle} (${serie.volumes.length} volumes) -> ${mergedTitle}`
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

  console.log(`✅ Merge complete!`);
  console.log(`📊 Original: ${window.kb.length} books`);
  console.log(`📊 Merged: ${mergedBooks.length} entries`);
  console.log(`📊 Series merged: ${Object.keys(series).length}`);
  console.log(`📊 Standalone books: ${standalone.length}`);
  console.log(`💾 Use exportMerged() to download merged CSV`);

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
  console.log(`📁 Download merged CSV: exportMerged()`);
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

window.exportMerged = function () {
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

// Test function for sequel merging
window.testSequelMerging = function () {
  console.log("🧪 Testing sequel merging with sample data...");

  // Sample test data based on output.csv patterns
  const testBooks = [
    {
      title: "プランダラ(1) (角川コミックス・エース)",
      author: "水無月 すう",
      format: "Kindle",
    },
    {
      title: "プランダラ(2) (角川コミックス・エース)",
      author: "水無月 すう",
      format: "Kindle",
    },
    {
      title: "プランダラ(3) (角川コミックス・エース)",
      author: "水無月 すう",
      format: "Kindle",
    },
    {
      title: "プランダラ(21) (角川コミックス・エース)",
      author: "水無月 すう",
      format: "Kindle",
    },
    {
      title: "NEXUS 情報の人類史 上　人間のネットワーク",
      author: "ユヴァル・ノア・ハラリ",
      format: "Kindle",
    },
    {
      title: "NEXUS 情報の人類史 下　AI革命",
      author: "ユヴァル・ノア・ハラリ",
      format: "Kindle",
    },
    { title: "あずまんが大王(1)", author: "あずまきよひこ", format: "Kindle" },
    { title: "あずまんが大王(2)", author: "あずまきよひこ", format: "Kindle" },
    { title: "あずまんが大王(3)", author: "あずまきよひこ", format: "Kindle" },
    { title: "あずまんが大王(4)", author: "あずまきよひこ", format: "Kindle" },
    {
      title: "不浄を拭うひと（分冊版） 【第1話】 (本当にあった笑える話)",
      author: "沖田×華",
      format: "Kindle",
    },
    {
      title: "不浄を拭うひと（分冊版） 【第2話】 (本当にあった笑える話)",
      author: "沖田×華",
      format: "Kindle",
    },
    {
      title: "不浄を拭うひと（分冊版） 【第3話】 (本当にあった笑える話)",
      author: "沖田×華",
      format: "Kindle",
    },
    {
      title: "第一集: 「いなげやの話 他」 川尻こだまのただれた生活",
      author: "川尻こだま",
      format: "Kindle",
    },
    {
      title: "第2集: 「町中華の話 他」 川尻こだまのただれた生活",
      author: "川尻こだま",
      format: "Kindle",
    },
    {
      title: "第三集: 『仮眠ライフハックの話 他』 川尻こだまのただれた生活",
      author: "川尻こだま",
      format: "Kindle",
    },
    { title: "単独の本", author: "テスト作者", format: "Kindle" },
  ];

  // Backup current data if it exists
  const originalKb = window.kb;
  window.kb = testBooks;

  console.log(`📚 Loaded ${testBooks.length} test books`);

  // Test the merging
  const result = window.mergeSequels();

  console.log("\n🧪 Test Results:");
  console.log("Expected merges:");
  console.log("  - プランダラ(1,2,3,21) (non-consecutive)");
  console.log("  - NEXUS 情報の人類史(上・下)");
  console.log("  - あずまんが大王(1-4) (consecutive)");
  console.log("  - 不浄を拭うひと（分冊版） 【第1-3話】");
  console.log("  - 川尻こだまのただれた生活 第1-3集");
  console.log("  - 単独の本 (unchanged)");

  console.log(`\n✅ Actual result: ${result.length} entries (expected ~6)`);

  if (window.kbMerged) {
    window.showMerged();
  }

  // Restore original data
  window.kb = originalKb;

  console.log("\n🧪 Test complete! Original data restored.");
};

// Show export options
if (window.kb.length > 0) {
  console.log("\n" + "=".repeat(50));
  console.log(`📚 ${window.kb.length} books collected. Export options:`);
  console.log("💾 Download file: downloadCSV()");
  console.log("📋 Copy to clipboard: copyCSV()");
  console.log("➡️ Navigate to next page: nextPage()");
  console.log("🧪 Test sequel merging: testSequelMerging()");
  console.log("=".repeat(50));
}
