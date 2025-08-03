# 📚 Kindle Book Collector

**English** | [日本語](README_ja.md)

A powerful browser-based JavaScript tool for collecting and exporting your complete Kindle library. Automatically scrapes book titles and authors from Amazon's Kindle library pages with multi-page support and CSV export functionality.

## ✨ Features

- **📖 Smart Book Collection**: Automatically extracts book titles and authors from Kindle library pages
- **🤖 Multi-Page Automation**: Seamlessly navigates through all pages of your library
- **💾 Multiple Export Options**: Download CSV files or copy data to clipboard
- **🔄 Real-Time Progress**: Live console feedback with collection status and progress
- **🎯 Robust Selectors**: Uses reliable DOM selectors that work with current Kindle library interface
- **⚡ Browser Console Interface**: Simple commands for easy operation

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
   Copy the entire contents of `simple_collect.js` and paste into the console, then press Enter.

4. **Start collecting**:
   ```javascript
   // For automated collection of all pages
   collectAllPages()
   
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
| `showResults()` | Display collection summary |

### Navigation Commands
| Command | Description |
|---------|-------------|
| `nextPage()` | Navigate to the next page manually |

### Export Commands
| Command | Description |
|---------|-------------|
| `downloadCSV()` | Download collected data as CSV file |
| `copyCSV()` | Copy CSV data to clipboard |
| `toCSV()` | Get CSV data as string |

### Utility Commands
| Command | Description |
|---------|-------------|
| `help()` | Show all available commands |
| `initializeKindleCollector()` | Re-initialize the collector if needed |

## 💾 Export Options

### CSV Format
The exported data includes:
- **Title**: Book title (commas replaced with full-width commas for CSV compatibility)
- **Author**: Author name (commas replaced with full-width commas for CSV compatibility)

### Export Methods

**Download File**:
```javascript
downloadCSV()
```
- Creates a file named `kindle_books_YYYY-MM-DD.csv`
- Automatically downloads to your default download folder

**Copy to Clipboard**:
```javascript
copyCSV()
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
   📖 The Great Gatsby by F. Scott Fitzgerald
   📖 To Kill a Mockingbird by Harper Lee
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
   🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
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

### Browser Compatibility
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

## 📝 Data Privacy

This tool:
- ✅ Runs entirely in your browser
- ✅ No data sent to external servers
- ✅ Only accesses your Kindle library page
- ✅ Data stays on your device

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue or submit a pull request.

## 📄 License

This project is open source and available under the MIT License.
