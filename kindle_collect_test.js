// Kindle Book Collector - Test Suite
// Load this file after kindle_collect.js to enable testing functionality
//
// Usage:
// 1. First load the main script: <script src="kindle_collect.js"></script>
// 2. Then load this test file: <script src="kindle_collect_test.js"></script>  
// 3. Run tests with: testSequelMerging()

console.log("🧪 Kindle Book Collector Test Suite loaded!");

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
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】9巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】13巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】29巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】8巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】33巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】23巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title:
        "ヘテロゲニア　リンギスティコ　～異種族言語学入門～　（６） (角川コミックス・エース)",
      author: "瀬野 反人",
      format: "Kindle",
    },
    {
      title:
        "ヘテロゲニア　リンギスティコ　～異種族言語学入門～　（５） (角川コミックス・エース)",
      author: "瀬野 反人",
      format: "Kindle",
    },
    {
      title:
        "ヘテロゲニア　リンギスティコ　～異種族言語学入門～　（４） (角川コミックス・エース)",
      author: "瀬野 反人",
      format: "Kindle",
    },
    {
      title:
        "マテリアル・パズル～神無き世界の魔法使い～（１０） (モーニングコミックス)",
      author: "土塚理弘",
      format: "Kindle",
    },
    {
      title:
        "マテリアル・パズル～神無き世界の魔法使い～（９） (モーニングコミックス)",
      author: "土塚理弘",
      format: "Kindle",
    },
    // Test cases for full-width digits
    {
      title: "テスト巻（１２）",
      author: "フルワイドテスト",
      format: "Kindle",
    },
    {
      title: "テスト巻（１３）",
      author: "フルワイドテスト", 
      format: "Kindle",
    },
    {
      title: "不浄を拭うひと（分冊版） 【第４話】 (本当にあった笑える話)",
      author: "沖田×華",
      format: "Kindle",
    },
    {
      title: "不浄を拭うひと（分冊版） 【第５話】 (本当にあった笑える話)",
      author: "沖田×華",
      format: "Kindle",
    },
    {
      title: "第４集: 『フルワイドテスト』 川尻こだまのただれた生活",
      author: "川尻こだま",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】２４巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
    {
      title: "Get Backers 奪還屋【極！単行本シリーズ】２５巻",
      author: "青樹佑夜， 綾峰欄人",
      format: "Kindle",
    },
  ];

  // Backup current data if it exists
  const originalKb = window.kb;
  window.kb = testBooks;

  console.log(`📚 Loaded ${testBooks.length} test books`);

  // Test the merging
  const result = window.mergeSequels();

  console.log("\n🧪 Test Results:");
  console.log("Expected merges:");
  console.log("  - プランダラ(1,2,3,21) (non-consecutive, half-width)");
  console.log("  - NEXUS 情報の人類史(上・下)");
  console.log("  - あずまんが大王(1-4) (consecutive, half-width)");
  console.log("  - 不浄を拭うひと（分冊版） 【第1-5話】 (mixed width)");
  console.log("  - 川尻こだまのただれた生活 第1-4集 (mixed width)");
  console.log(
    "  - Get Backers 奪還屋【極！単行本シリーズ】(8,9,13,23-25,29,33)巻 (mixed width)"
  );
  console.log(
    "  - ヘテロゲニア　リンギスティコ　～異種族言語学入門～　（4-6） (full-width)"
  );
  console.log(
    "  - マテリアル・パズル～神無き世界の魔法使い～（9,10） (full-width)"
  );
  console.log("  - テスト巻（12,13） (full-width brackets)");
  console.log("  - 単独の本 (unchanged)");

  console.log(`\n✅ Actual result: ${result.length} entries (expected ~10)`);

  if (window.kbMerged) {
    window.showMerged();
  }

  // Restore original data
  window.kb = originalKb;

  console.log("\n🧪 Test complete! Original data restored.");
};