# 🚀 clasp を使用した Google Apps Script (kindle_book_from_gmail.js) のデプロイ手順

`clasp` (Command Line Apps Script Projects) を利用して、ローカル環境から `kindle_book_from_gmail.js` を Google Apps Script (GAS) にデプロイする手順です。

---

## 1. 事前準備 (Google Apps Script API の有効化)

初回のみ、Google アカウントで Apps Script API をオンにする必要があります。

1. [Google Apps Script ユーザー設定](https://script.google.com/home/usersettings) にアクセスします。
2. **Google Apps Script API** の項目を **「オン (ON)」** に変更します。

---

## 2. 依存パッケージのインストール

プロジェクトルート配下で以下を実行し、`@google/clasp` をインストールします。

```bash
npm install
```

> 💡 グローバルに clasp をインストールして使用する場合は `npm install -g @google/clasp` を実行してください。

---

## 3. Google アカウントへのログイン

`clasp` で Google アカウントにログインします。

```bash
npm run login
# または
npx clasp login
```

実行するとブラウザが開き、Google アカウントの認証画面が表示されます。アクセスを許可して認証を完了してください。

---

## 4. GAS プロジェクトの作成・連携

### パターン A: 新規に GAS プロジェクトを作成する場合

以下のコマンドで新規の Standalone スクリプトを作成します。自動的に `.clasp.json` が生成されます。

```bash
npm run create
# または
npx clasp create --type standalone --title "kindle_book_from_gmail"
```

### パターン B: 既存の GAS プロジェクトと連携する場合

1. ブラウザで既存の GAS プロジェクトを開き、URL から Script ID を確認します。
   - URL 例: `https://script.google.com/d/<SCRIPT_ID>/edit`
2. `.clasp.json.sample` をコピーして `.clasp.json` を作成します。
   ```bash
   cp .clasp.json.sample .clasp.json
   ```
3. `.clasp.json` の `"scriptId"` をコピーした Script ID に書き換えます。
   ```json
   {
     "scriptId": "YOUR_ACTUAL_SCRIPT_ID",
     "rootDir": "."
   }
   ```
   > 💡 または `npx clasp clone <SCRIPT_ID>` を実行することでも連携可能です。

---

## 5. スクリプトのプッシュ (Push)

ローカルの `kindle_book_from_gmail.js` および `appsscript.json` を GAS 側にアップロードします。
※ `.claspignore` により、`kindle_book_from_gmail.js` と `appsscript.json` のみが対象となります。

```bash
npm run push
# または
npx clasp push
```

---

## 6. デプロイの実行 (Deploy)

GAS 上でバージョンを作成・デプロイします。

```bash
npm run deploy
# または
npx clasp deploy --description "Kindle Book Extractor Deployment"
```

---

## 7. Web エディタでの設定・動作確認

プロジェクトをブラウザで開くには以下のコマンドを実行します。

```bash
npm run open
# または
npx clasp open
```

1. **スクリプト内設定 (`CONFIG`)**: `kindle_book_from_gmail.js` 内の `SPREADSHEET_ID` や `SHEET_ID` などの設定値を必要に応じて編集してください。
2. **初回実行 & 権限承認**: `main()` 関数を手動実行し、Gmail やスプレッドシートへのアクセス権限を承認します。
3. **トリガー設定（任意）**: 毎日の自動実行を行う場合は、GAS エディタの「トリガー (時計アイコン)」から定期実行を設定してください。
