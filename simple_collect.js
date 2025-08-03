// Kindle Book Collector - Multi-page friendly script

// Initialize the collector (run once)
window.initializeKindleCollector = function () {
  if (!window.kb) window.kb = [];

  // Collect books from current page
  window.collectBooks = function () {
    const books = [];
    $$("table tr.ListItem-module_row__3orql").forEach((row) => {
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
          title: title.replace(/,/g, "，"),
          author: author.replace(/,/g, "，"),
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
  window.nextPage = function () {
    // Find current active page
    const activePage = document.querySelector(".page-item.active");
    let nextButton = null;

    if (activePage) {
      // Get current page number from ID (e.g., "page-2" -> 2)
      const currentPageNum = parseInt(activePage.id.replace("page-", ""));
      const nextPageNum = currentPageNum + 1;

      // Try to find next numbered page
      nextButton = document.querySelector(`#page-${nextPageNum}`);

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


  window.collectAllPages = function () {
    console.log("🚀 Starting automated collection...");

    function collectAndNavigate() {
      setTimeout(() => {
        const count = window.collectBooks();
        if (count > 0) {
          setTimeout(() => {
            // Use the same logic as nextPage() for consistency
            const activePage = document.querySelector(".page-item.active");
            let nextButton = null;

            if (activePage) {
              const currentPageNum = parseInt(
                activePage.id.replace("page-", "")
              );
              const nextPageNum = currentPageNum + 1;
              nextButton = document.querySelector(`#page-${nextPageNum}`);
            }

            if (nextButton) {
              nextButton.click();
              console.log("🔄 Auto-navigating to next page...");
              setTimeout(collectAndNavigate, 5000); // Wait 2 seconds for page load
            } else {
              window.showResults();
            }
          }, 1000);
        } else {
          window.showResults();
        }
      }, 1000);
    }

    collectAndNavigate();
  };

  window.showResults = function () {
    console.log("\n" + "🎉".repeat(20));
    console.log(`📚 Collection complete! Total books: ${window.kb.length}`);
    console.log("💾 Use downloadCSV() or copyCSV() to export data");
    console.log("🎉".repeat(20));
  };

  // Help function to show all available commands
  window.help = function () {
    console.log("🚀 Kindle Book Collector - Available Commands:");
    console.log("\n📚 Collection Commands:");
    console.log("📖 collectBooks()       - Collect books from current page");
    console.log("🤖 collectAllPages()    - Auto-collect from all pages");
    console.log("📊 showResults()        - Show collection summary");

    console.log("\n🧭 Navigation Commands:");
    console.log("➡️ nextPage()           - Navigate to next page");

    console.log("\n💾 Export Commands:");
    console.log("💾 downloadCSV()        - Download CSV file");
    console.log("📋 copyCSV()            - Copy CSV to clipboard");
    console.log("📄 toCSV()              - Get CSV data as string");

    console.log("\n🔧 Utility Commands:");
    console.log("❓ help()               - Show this help message");
    console.log("🔄 initializeKindleCollector() - Re-initialize if needed");

    console.log(
      `\n📊 Current Status: ${window.kb ? window.kb.length : 0} books collected`
    );
  };

  console.log("🚀 Kindle Collector initialized!");
  window.help();
};

// Initialize and collect from first page
if (!window.kb) {
  window.initializeKindleCollector();
}

// Collect from current page
const collected = window.collectBooks();

// CSV Export Functions
window.toCSV = function () {
  const header = "Title,Author\n";
  const rows = window.kb
    .map((book) => `"${book.title}","${book.author}"`)
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

window.copyCSV = function () {
  const csv = window.toCSV();
  copy(csv);
  console.log(`📋 CSV data copied to clipboard! (${window.kb.length} books)`);
};


// Show export options
if (window.kb.length > 0) {
  console.log("\n" + "=".repeat(50));
  console.log(`📚 ${window.kb.length} books collected. Export options:`);
  console.log("💾 Download file: downloadCSV()");
  console.log("📋 Copy to clipboard: copyCSV()");
  console.log("=".repeat(50));
}
