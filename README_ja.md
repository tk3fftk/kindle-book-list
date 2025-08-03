# 📚 Kindle ブックコレクター

[English](README.md) | **日本語**

Amazon Kindleライブラリから本のタイトルと著者を自動収集・エクスポートする強力なブラウザベースJavaScriptツールです。複数ページ対応とCSVエクスポート機能を備えています。

## ✨ 機能

- **📖 スマートブック収集**: Kindleライブラリページから本のタイトルと著者を自動抽出
- **🤖 複数ページ自動化**: ライブラリの全ページをシームレスに巡回
- **💾 複数エクスポートオプション**: CSVファイルダウンロードまたはクリップボードへのコピー
- **🔄 リアルタイム進捗**: 収集状況と進捗のライブコンソールフィードバック
- **🎯 堅牢なセレクター**: 現在のKindleライブラリインターフェースで動作する信頼性の高いDOMセレクター
- **⚡ ブラウザコンソールインターフェース**: 簡単操作のためのシンプルなコマンド

## 🚀 クイックスタート

### 前提条件
- モダンなウェブブラウザ（Chrome、Firefox、Safari、Edge）
- Amazon Kindleライブラリへのアクセス

### セットアップと使用方法

1. **Kindleライブラリに移動**:
   ```
   https://read.amazon.com/kindle-library
   ```

2. **ブラウザの開発者コンソールを開く**:
   - **Chrome/Edge**: `F12`キーまたは`Ctrl+Shift+I`（Windows）/`Cmd+Option+I`（Mac）
   - **Firefox**: `F12`キーまたは`Ctrl+Shift+K`（Windows）/`Cmd+Option+K`（Mac）
   - **Safari**: `Cmd+Option+I`（最初に開発者メニューを有効にする必要があります）

3. **スクリプトをコピー&ペースト**:
   `simple_collect.js`の全内容をコピーしてコンソールに貼り付け、Enterキーを押します。

4. **収集開始**:
   ```javascript
   // 全ページの自動収集
   collectAllPages()
   
   // またはページごとの手動収集
   collectBooks()  // 現在のページを収集
   nextPage()      // 次のページに移動
   ```

## 📋 利用可能なコマンド

### 収集コマンド
| コマンド | 説明 |
|---------|------|
| `collectBooks()` | 現在のページから本を収集 |
| `collectAllPages()` | 全ページから自動収集 |
| `showResults()` | 収集結果のサマリーを表示 |

### ナビゲーションコマンド
| コマンド | 説明 |
|---------|------|
| `nextPage()` | 次のページに手動移動 |

### エクスポートコマンド
| コマンド | 説明 |
|---------|------|
| `downloadCSV()` | 収集データをCSVファイルとしてダウンロード |
| `copyCSV()` | CSVデータをクリップボードにコピー |
| `toCSV()` | CSVデータを文字列として取得 |

### ユーティリティコマンド
| コマンド | 説明 |
|---------|------|
| `help()` | 利用可能な全コマンドを表示 |
| `initializeKindleCollector()` | 必要に応じてコレクターを再初期化 |

## 💾 エクスポートオプション

### CSVフォーマット
エクスポートされるデータには以下が含まれます：
- **タイトル**: 本のタイトル（CSV互換性のためカンマを全角カンマに置換）
- **著者**: 著者名（CSV互換性のためカンマを全角カンマに置換）

### エクスポート方法

**ファイルダウンロード**:
```javascript
downloadCSV()
```
- `kindle_books_YYYY-MM-DD.csv`という名前のファイルを作成
- デフォルトのダウンロードフォルダに自動ダウンロード

**クリップボードにコピー**:
```javascript
copyCSV()
```
- CSVデータを直接クリップボードにコピー
- スプレッドシートアプリケーションへの貼り付けに最適

## 🔧 動作原理

スクリプトはDOMセレクターを使用してKindleライブラリページの本エントリを識別します：
- **本のタイトル**: `div[role="heading"][aria-level="4"]`要素から抽出
- **著者**: `div[id^="content-author-"]`要素から抽出
- **ナビゲーション**: `#page-{番号}`のIDパターンを持つページネーションボタンを使用

## 📊 ワークフロー例

1. **初期化**: スクリプト貼り付け時に自動初期化
2. **収集**: 現在のページから本を収集
   ```
   📖 The Great Gatsby by F. Scott Fitzgerald
   📖 To Kill a Mockingbird by Harper Lee
   ✅ Added 25 books from this page. Total: 25
   ```
3. **ナビゲーション**: 次のページに自動移動
   ```
   🔄 Moving from page 1 to page 2...
   ```
4. **完了**: 最終結果を表示
   ```
   🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
   📚 Collection complete! Total books: 347
   💾 Use downloadCSV() or copyCSV() to export data
   🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
   ```

## 🛠️ トラブルシューティング

### よくある問題

**スクリプトが本を見つけられない**:
- 正しいKindleライブラリページにいることを確認
- ライブラリに収集する本があることを確認
- ページを更新してスクリプトを再実行してみる

**ナビゲーションが動作しない**:
- ページネーションコントロールがページに表示されていることを確認
- 本の数が少ないライブラリではページネーションがない場合があります
- `nextPage()`を使用した手動ナビゲーションを試す

**エクスポートが動作しない**:
- ダウンロードに対するブラウザの許可を確認
- クリップボードコピーの場合、ブラウザタブがアクティブでフォーカスされていることを確認

### ブラウザ互換性
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

## 📝 データプライバシー

このツールは：
- ✅ 完全にブラウザ内で動作
- ✅ 外部サーバーにデータを送信しません
- ✅ Kindleライブラリページのみにアクセス
- ✅ データはデバイス内に留まります

## 🤝 コントリビューション

バグを発見したり、機能要求がありましたら、issueを開くかプルリクエストを送信してください。

## 📄 ライセンス

このプロジェクトはオープンソースで、Beerwareライセンスの下で利用可能です。

```
"THE BEER-WARE LICENSE" (Revision 42):
<tktks@example.com> wrote this file. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return. tktks
```