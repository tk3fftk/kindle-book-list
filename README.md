# 📚 Kindle Book Collector

**English** | [日本語](README_ja.md)

A powerful browser-based JavaScript tool for collecting and exporting your complete Kindle library. Automatically scrapes book titles and authors from Amazon's Kindle library pages with multi-page support and CSV export functionality.

## ✨ Features

- **📖 Smart Book Collection**: Automatically extracts book titles and authors from Kindle library pages
- **🤖 Multi-Page Automation**: Seamlessly navigates through all pages of your library
- **🔗 Advanced Sequel Series Merging**: Automatically merges sequel series with 8 distinct pattern recognition algorithms
- **🎭 Mixed Pattern Recognition**: Handles series using multiple numbering formats simultaneously (e.g., parenthetical + trailing numbers)
- **👤 Author Normalization**: Smart grouping handles author variants (e.g., `"Author， Co-Author"` → `"Author"`)
- **🌏 Full-Width Character Support**: Handles both ASCII and full-width digits/brackets seamlessly
- **💾 Multiple Export Options**: Download CSV files or copy data to clipboard for both original and merged data
- **🔄 Real-Time Progress**: Live console feedback with collection status and mixed pattern detection
- **🎯 Robust Selectors**: Uses reliable DOM selectors that work with current Kindle library interface
- **⚡ Browser Console Interface**: Simple commands for easy operation with built-in testing functions

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Access to your Amazon Kindle library

### Setup & Usage

1. **Navigate to your Kindle library**:
   ```
   https://read.amazon.com/kindle-library
   ```

2. **Open browser developer console**:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari**: Press `Cmd+Option+I` (enable Developer menu first)

3. **Copy and paste the script**:
   Copy the entire contents of `kindle_collect.js` and paste into the console, then press Enter.

4. **Start collecting**:
   ```javascript
   // For automated collection of all pages
   collectAllPages()
   
   // For automated collection with sequel merging
   collectAllPages({mergeSequels: true})
   
   // Or collect manually page by page
   collectBooks()  // Collect current page
   nextPage()      // Navigate to next page
   ```

## 📋 Available Commands

### Collection Commands

| Command | Description |
|---------|-------------|
| `collectBooks()` | Collect books from the current page |
| `collectAllPages()` | Automatically collect from all pages |
| `collectAllPages({mergeSequels: true})` | Auto-collect all pages and merge sequels |
| `showResults()` | Display collection summary |

### Navigation Commands

| Command | Description |
|---------|-------------|
| `nextPage()` | Navigate to the next page manually |

### Sequel Merging Commands

| Command | Description |
|---------|-------------|
| `mergeSequels()` | Merge sequel series into volume ranges |
| `showMerged()` | Show merged collection summary |

### Export Commands

| Command | Description |
|---------|-------------|
| `downloadCSV()` | Download original collected data as CSV file |
| `downloadMergedCSV()` | Download merged collection as CSV file |
| `copyCSV()` | Copy original CSV data to clipboard |
| `copyMergedCSV()` | Copy merged CSV data to clipboard |
| `toCSV()` | Get original CSV data as string |
| `toMergedCSV()` | Get merged CSV data as string |

### Utility Commands

| Command | Description |
|---------|-------------|
| `help()` | Show all available commands |
| `initializeKindleCollector()` | Re-initialize the collector if needed |
| `testPrefixCollection()` | Test prefix collection pattern (e.g., `1集 Title` format) |

## 💾 Export Options

### CSV Format

The exported data includes:

- **Title**: Book title (commas replaced with full-width commas for CSV compatibility)
- **Author**: Author name (commas replaced with full-width commas for CSV compatibility)
- **Format**: Always "Kindle"

### Sequel Merging

The tool automatically detects and merges sequel series using **8 distinct pattern recognition algorithms**:

**Supported Patterns:**
- **Numbered volumes**: `Title(1)`, `Title(2)` → `Title(1-2)` or `Title(1,3,5)` for non-consecutive
- **Full-width brackets**: `Title（１）`, `Title（２）` → `Title（1-2）`
- **Volume format**: `Title9巻`, `Title13巻` → `Title(9,13)巻`
- **Chapter format**: `Title【第1話】`, `Title【第2話】` → `Title【第1-2話】`
- **Collection format**: `Title第一集`, `Title第二集` → `Title第1-2集`
- **Prefix collection**: `1集 Title`, `2集 Title` → `Title(1-2)集` *(NEW: volumes at beginning)*
- **Upper/Lower**: `Title上`, `Title下` → `Title(上・下)`
- **Space + number**: `Title1`, `Title 2`, `Title　3` → `Title(1-3)` for titles with space-separated numbers
- **Title ending number**: `Title1`, `Title2`, `Title3` → `Title(1-3)` for titles ending with numbers

**🎭 Mixed Pattern Support:**
- Series can use **multiple numbering formats** (e.g., `Title(2,3,4)` + `Title１１` → `Title(2,3,4,11)`)
- Author variants are automatically normalized for better grouping

### Export Methods

**Download Original Data**:
```javascript
downloadCSV()
```

- Creates a file named `kindle_books_YYYY-MM-DD.csv`
- Downloads original collected data
- Automatically downloads to your default download folder

**Download Merged Data**:
```javascript
downloadMergedCSV()
```

- Creates a file named `kindle_books_merged_YYYY-MM-DD.csv`
- Downloads data with sequel series merged
- Significantly reduces duplicate entries

**Copy to Clipboard**:
```javascript
copyCSV()         // Copy original data
copyMergedCSV()   // Copy merged data
```

- Copies CSV data directly to clipboard
- Perfect for pasting into spreadsheet applications

## 🔧 How It Works

The script uses DOM selectors to identify book entries on Kindle library pages:

- **Book Titles**: Extracted from `div[role="heading"][aria-level="4"]` elements
- **Authors**: Extracted from `div[id^="content-author-"]` elements
- **Navigation**: Uses pagination buttons with ID pattern `#page-{number}`

## 📊 Example Workflow

1. **Initialize**: Script automatically initializes when pasted
2. **Collect**: Gathers books from current page
   ```
   📖 Book Title 1 by Author A
   📖 Book Title 2 by Author B
   ✅ Added 25 books from this page. Total: 25
   ```
3. **Navigate**: Automatically moves to next page
   ```
   🔄 Moving from page 1 to page 2...
   ```
4. **Complete**: Shows final results
   ```
   🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
   📚 Collection complete! Total books: 347
   💾 Use downloadCSV() or copyCSV() to export data
   🔗 Use mergeSequels() to combine sequel series
   🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
   ```

5. **Optional**: Merge sequel series
   ```
   🔄 Merging sequels from 347 books...
   🔗 Mixed patterns detected for "Series C" by Author A: numberedVolumes, titleEndingNumber
   📚 Merged: Series A (21 volumes) -> Series A(1-21)
   📚 Merged: Series B (9 volumes) -> Series B(1-9)集
   📚 Merged: Series C (14 volumes) [Mixed: numberedVolumes,titleEndingNumber] -> Series C(2-13)
   ✅ Merge complete!
   📊 Original: 347 books
   📊 Merged: 298 entries
   📊 Series merged: 52
   📊 Standalone books: 246
   🔗 Mixed pattern series: 3
   💾 Use downloadMergedCSV() to download merged CSV
   ```

## 🛠️ Troubleshooting

### Common Issues

**Script doesn't find books**:

- Ensure you're on the correct Kindle library page
- Check that your library has books to collect
- Try refreshing the page and running the script again

**Navigation not working**:

- Verify pagination controls are visible on the page
- Some libraries with few books may not have pagination
- Try manual navigation with `nextPage()`

**Export not working**:

- Check browser permissions for downloads
- For clipboard copy, ensure the browser tab is active and focused

## 📝 Data Privacy

This tool:

- ✅ Runs entirely in your browser
- ✅ No data sent to external servers
- ✅ Only accesses your Kindle library page
- ✅ Data stays on your device

## 🚀 Deploying Google Apps Script (kindle_book_from_gmail.js)

`kindle_book_from_gmail.js` extracts Kindle books from Gmail purchase receipts into Google Sheets. You can deploy it to Google Apps Script using `clasp`:

See [DEPLOYMENT_GAS.md](DEPLOYMENT_GAS.md) for step-by-step instructions.

```bash
npm install          # Install dependencies
npm run login        # Authenticate clasp with Google
npm run create       # Create new GAS project (or set up .clasp.json)
npm run push         # Push code (targets kindle_book_from_gmail.js only)
npm run deploy       # Deploy version
```

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue or submit a pull request.

## 📄 License

This project is licensed under the Beerware License - see the [LICENSE](LICENSE) file for details.
