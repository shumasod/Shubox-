// 擬似「足あと」データ
const visitors = [
    "佐藤花子さん",
    "山田次郎さん",
    "鈴木美香さん",
    "高橋健一さん",
    "田村雅子さん",
    "中村和也さん"
];

function generateAshiato() {
    const container = document.getElementById("ashiato-log");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        const name = visitors[Math.floor(Math.random() * visitors.length)];
        const minutesAgo = Math.floor(Math.random() * 60) + 1;

        const entry = document.createElement("div");
        entry.style.fontSize = "11px";
        entry.style.borderBottom = "1px dotted #ccc";
        entry.style.padding = "3px 0";
        entry.innerHTML = `<strong>${name}</strong> さんがあなたのページを訪問しました <span style="color: #666;">(${minutesAgo}分前)</span>`;
        container.appendChild(entry);
    }
}

window.onload = generateAshiato;
