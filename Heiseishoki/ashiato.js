// 擬似「足あと」データ
const visitors = [
“佐藤花子”,
“山田次郎”,
“鈴木美香”,
“高橋健一”,
“田村雅子”,
“中村和也”,
“森田智子”,
“小林浩二”,
“松本由美”,
“岡田大輔”
];

function getRandomVisitors(count = 3) {
// 重複を避けるために配列をシャッフルして選択
const shuffled = […visitors].sort(() => 0.5 - Math.random());
return shuffled.slice(0, Math.min(count, visitors.length));
}

function formatTimeAgo(minutes) {
if (minutes < 60) {
return `${minutes}分前`;
} else if (minutes < 1440) { // 24時間未満
const hours = Math.floor(minutes / 60);
return `${hours}時間前`;
} else {
const days = Math.floor(minutes / 1440);
return `${days}日前`;
}
}

function generateAshiato() {
const container = document.getElementById(“ashiato-log”);
if (!container) {
console.warn(“ashiato-log要素が見つかりません”);
return;
}

```
// コンテナをクリア
container.innerHTML = "";

try {
    const selectedVisitors = getRandomVisitors(3);
    
    selectedVisitors.forEach((name, index) => {
        // より現実的な時間の分布
        const minutesAgo = Math.floor(Math.random() * 180) + 1; // 1-180分前
        
        const entry = document.createElement("div");
        entry.className = "ashiato-entry";
        entry.style.cssText = `
            font-size: 11px;
            border-bottom: 1px dotted #ddd;
            padding: 6px 0;
            line-height: 1.4;
            color: #333;
            transition: background-color 0.2s ease;
        `;
        
        entry.innerHTML = `
            <strong style="color: #0066cc;">${name}</strong>さんがあなたのページを訪問しました 
            <span style="color: #999; font-size: 10px;">${formatTimeAgo(minutesAgo)}</span>
        `;
        
        // ホバー効果
        entry.addEventListener('mouseenter', () => {
            entry.style.backgroundColor = '#f8f9fa';
        });
        
        entry.addEventListener('mouseleave', () => {
            entry.style.backgroundColor = 'transparent';
        });
        
        container.appendChild(entry);
    });
    
    // 更新時刻を表示
    const updateTime = document.createElement("div");
    updateTime.style.cssText = `
        font-size: 9px;
        color: #999;
        text-align: center;
        margin-top: 8px;
        padding-top: 5px;
        border-top: 1px solid #eee;
    `;
    updateTime.textContent = `最終更新: ${new Date().toLocaleTimeString('ja-JP')}`;
    container.appendChild(updateTime);
    
} catch (error) {
    console.error("足あと生成中にエラーが発生しました:", error);
    container.innerHTML = '<div style="color: #999; font-size: 10px;">データの読み込みに失敗しました</div>';
}
```

}

// 定期的に更新する機能
function startAshiatoUpdater(intervalMinutes = 5) {
generateAshiato(); // 初回実行

```
// 指定した間隔で更新
setInterval(() => {
    generateAshiato();
}, intervalMinutes * 60 * 1000);
```

}

// ページ読み込み時に開始
window.addEventListener(‘load’, () => {
startAshiatoUpdater(5); // 5分間隔で更新
});

// 手動更新用の関数をグローバルに公開
window.refreshAshiato = generateAshiato;