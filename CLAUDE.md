# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based JavaScript tool for collecting and organizing Kindle library data. The tool runs entirely in the browser console, scrapes book data from Amazon's Kindle library pages, and exports it as CSV files. A key feature is intelligent sequel series merging that handles complex Japanese text patterns.

## Core Architecture

### Main Script (`kindle_collect.js`)
- **Pattern-based sequel detection**: 8 different patterns for detecting sequel series (numbered volumes, upper/lower divisions, chapter formats, etc.)
- **Smart grouping system**: Groups books by normalized author + base title, handles mixed pattern types within same series
- **Full-width character support**: Converts full-width digits (０-９) and Japanese numerals to ASCII for consistent processing
- **Browser automation**: Multi-page navigation and data collection via DOM selectors

### Key Components

**Pattern Recognition Engine** (lines 225-404):
- `sequelPatterns` object defines 8 distinct patterns for sequel detection
- Each pattern has regex and extract function for processing titles
- Patterns include: numbered volumes, upper/lower (上/下), chapters (【第X話】), collections (第X集), volume format (X巻), space+number, title ending number, prefix collection (1集 Title)

**Sequel Extraction** (lines 407-416):
- `extractSequelInfo()` analyzes titles and extracts sequel information using all patterns
- Returns base title, volume number, pattern type, and additional metadata

**Author Normalization** (lines 419-433):
- `normalizeAuthor()` handles author variants (e.g., "がちょん次郎， 六代目" → "がちょん次郎")
- Extracts main author before common separators for consistent grouping

**Series Grouping Logic** (lines 436-495):
- Pattern-agnostic series keys prevent splitting of mixed-format series
- Tracks multiple pattern types per series with `Set` data structure
- Updates author information to use the most complete variant

**Volume Range Formatting** (lines 498-568):
- Smart consecutive vs non-consecutive range formatting
- Pattern-specific output formatting (parentheses, brackets, suffixes)
- Special handling for upper/lower divisions
- Dominant pattern selection for mixed-pattern series

## Testing

### Test Suite (`kindle_collect_test.js`)
- Comprehensive test data covering all 8 sequel patterns
- Tests mixed-width characters, non-consecutive volumes, author variants
- `testSequelMerging()` function for validating merge logic
- Backup/restore mechanism for testing with live data

### Manual Testing
- `testSequelFix()` function tests specific splitting issues
- Browser console interface for real-time testing

## Development Commands

**Initialize and collect data:**
```javascript
// Load and initialize the collector
initializeKindleCollector()

// Collect from current page
collectBooks()

// Automated multi-page collection
collectAllPages()
collectAllPages({mergeSequels: true})
```

**Testing:**
```javascript
// Run comprehensive test suite
testSequelMerging()

// Test specific splitting issue fixes
testSequelFix()
```

**Data processing:**
```javascript
// Merge sequel series
mergeSequels()

// Export data
downloadCSV()
downloadMergedCSV()
copyCSV()
copyMergedCSV()
```

## Key Data Structures

**Book Object:**
```javascript
{
  title: string,      // Sanitized title with CSV-safe formatting  
  author: string,     // Sanitized author with CSV-safe formatting
  format: "Kindle"    // Always "Kindle"
}
```

**Series Object:**
```javascript
{
  author: string,              // Original author (most complete)
  normalizedAuthor: string,    // Normalized for grouping
  baseTitle: string,           // Base title without volume info
  types: Set<string>,          // All pattern types used in series
  volumes: Array<VolumeInfo>,  // Volume details
  suffix: string               // Common suffix
}
```

## Japanese Text Processing

The tool is specifically designed for Japanese content:
- Handles full-width digits (１２３) and ASCII digits (123)
- Processes Japanese numerals (一二三) 
- Supports various bracket types ((), （）, 【】)
- Manages mixed-width character scenarios
- Author name normalization for variants with co-authors

## DOM Integration

**Selectors used:**
- Book titles: `div[role="heading"][aria-level="4"]`
- Authors: `div[id^="content-author-"]`
- Navigation: `#page-{number}` pagination buttons

**Browser Requirements:**
- Modern browser with console access
- Must be run on actual Kindle library pages
- Requires active browser tab for clipboard operations

## Common Issues and Solutions

**Series Splitting:** The recent fix addresses cases where different numbering patterns (e.g., `Title(1,2,3)` vs `Title４`) were treated as separate series. The solution uses pattern-agnostic grouping and author normalization.

**Mixed Pattern Handling:** Series can now use multiple numbering patterns simultaneously, with the dominant pattern used for final formatting.

**Author Variants:** The `normalizeAuthor()` function handles cases where the same author appears with different formatting (e.g., with/without co-authors).