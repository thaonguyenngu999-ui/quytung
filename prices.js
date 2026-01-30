// ==========================================
// GIÁ VÀNG THÁI NGUYÊN - TỰ ĐỘNG CẬP NHẬT
// Nguồn: BTMC, SJC, DOJI + tham khảo Kim Tín
// ==========================================

const LAST_UPDATE = "19:15 30/01/2026";

const GOLD_PRICES = {
    quyTung: {
        name: "Vàng Bạc Quý Tùng",
        address: "142 Lương Ngọc Quyến, TP. Thái Nguyên",
        phone: "",
        website: "",
        products: [
            { name: "Nhẫn tròn trơn", desc: "Vàng 999.9 nguyên chất", purity: "999.9", purityLabel: "24K", buy: 16382, sell: 17018 },
            { name: "Nhẫn tròn ép vỉ", desc: "Vàng 999.9 nguyên chất", purity: "999.9", purityLabel: "24K", buy: 16382, sell: 17018 },
            { name: "Vàng miếng SJC", desc: "Vàng miếng chính hãng SJC", purity: "999.9", purityLabel: "24K", buy: 17282, sell: 17718 },
            { name: "Trang sức 18K", desc: "Trang sức vàng 750", purity: "750", purityLabel: "18K", buy: 12460, sell: 12980 }
        ]
    },
    kimTin: {
        name: "Tập Đoàn Kim Tín",
        address: "56 Lương Ngọc Quyến, TP. Thái Nguyên",
        phone: "",
        website: "kimtin.vn",
        products: [
            { name: "Nhẫn tròn trơn", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: 16402, sell: 16998 },
            { name: "Nhẫn tròn ép vỉ", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: 16402, sell: 16998 },
            { name: "Quà mừng vàng", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: 16402, sell: 16998 },
            { name: "Vàng miếng SJC", desc: "Vàng miếng chính hãng SJC", purity: "999.9", purityLabel: "24K", buy: 17302, sell: 17698 },
            { name: "Trang sức 18K", desc: "Trang sức vàng 750", purity: "750", purityLabel: "18K", buy: 12480, sell: 12960 }
        ]
    },
    btmc: {
        name: "Bảo Tín Minh Châu",
        address: "Toàn quốc",
        phone: "1800.599.920",
        website: "btmc.vn",
        hasApi: true,
        apiNote: "Lấy từ BTMC API",
        products: [
            { name: "Nhẫn Trơn 999.9", desc: "Vàng nhẫn tròn trơn BTMC", purity: "999.9", purityLabel: "24K", buy: 16367, sell: 17033 },
            { name: "Nhẫn Rồng Phụng", desc: "Vàng nhẫn họa tiết BTMC", purity: "999.9", purityLabel: "24K", buy: 16700, sell: 17350 },
            { name: "Vàng miếng SJC", desc: "Vàng miếng SJC chính hãng", purity: "999.9", purityLabel: "24K", buy: 17267, sell: 17733 }
        ]
    },
    sjc: {
        name: "SJC (Vàng Bạc SG)",
        address: "Toàn quốc",
        phone: "1900.54.54.78",
        website: "sjc.com.vn",
        hasApi: true,
        apiNote: "Lấy từ SJC",
        products: [
            { name: "Vàng miếng SJC 1L", desc: "Vàng miếng SJC 1 lượng", purity: "999.9", purityLabel: "24K", buy: 17267, sell: 17733 },
            { name: "Vàng nhẫn SJC 99.99", desc: "Nhẫn tròn trơn SJC", purity: "999.9", purityLabel: "24K", buy: 16367, sell: 17033 },
            { name: "Vàng nữ trang 99.99", desc: "Trang sức vàng 24K", purity: "999.9", purityLabel: "24K", buy: 12445, sell: 12995 }
        ]
    },
    pnj: {
        name: "PNJ",
        address: "Vincom Thái Nguyên",
        phone: "1800.54.54.57",
        website: "pnj.com.vn",
        hasApi: false,
        products: [
            { name: "Vàng miếng SJC", desc: "Vàng miếng SJC chính hãng", purity: "999.9", purityLabel: "24K", buy: 17252, sell: 17748 },
            { name: "Nhẫn tròn PNJ 24K", desc: "Nhẫn vàng 999.9 PNJ", purity: "999.9", purityLabel: "24K", buy: 16352, sell: 17048 }
        ]
    },
    doji: {
        name: "DOJI",
        address: "Toàn quốc",
        phone: "1800.1168",
        website: "doji.vn",
        hasApi: false,
        products: [
            { name: "Hưng Thịnh Vượng", desc: "Vàng miếng DOJI", purity: "999.9", purityLabel: "24K", buy: 17252, sell: 17748 },
            { name: "Nhẫn tròn DOJI", desc: "Nhẫn vàng 999.9 DOJI", purity: "999.9", purityLabel: "24K", buy: 16352, sell: 17048 }
        ]
    }
};

let currentUnit = 'chi';
const UNIT_CONFIG = {
    chi: { multiplier: 1, label: '1 Chỉ (3.75g)', shortLabel: '/chỉ', gramWeight: 3.75 },
    luong: { multiplier: 10, label: '1 Lượng (37.5g)', shortLabel: '/lượng', gramWeight: 37.5 },
    gram: { multiplier: 1 / 3.75, label: '1 Gram', shortLabel: '/gram', gramWeight: 1 }
};

function convertPrice(p, u) { return Math.round(p * UNIT_CONFIG[u].multiplier); }
function formatPrice(p) { return p.toLocaleString('vi-VN'); }

function renderPriceTable(id, key) {
    const c = document.getElementById(id);
    if (!c || !GOLD_PRICES[key]) return;
    const shop = GOLD_PRICES[key];
    c.innerHTML = '';
    shop.products.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = "price-row " + (index === 0 ? 'highlight' : '') + (item.name.includes('SJC') ? ' sjc-row' : '');
        row.innerHTML = '             <td class="product-info">                 <div class="product-name-main">' + item.name.toUpperCase() + '</div>                 <div class="product-desc">' + item.desc + '</div>             </td>             <td class="purity">                 <span class="purity-value">' + item.purity + '</span>                 <span class="purity-label">(' + item.purityLabel + ')</span>             </td>             <td class="price buy-price">                 <span class="price-value">' + formatPrice(convertPrice(item.buy, currentUnit)) + '</span>             </td>             <td class="price sell-price">                 <span class="price-value">' + formatPrice(convertPrice(item.sell, currentUnit)) + '</span>             </td>';
        c.appendChild(row);
    });
}

function renderAllTables() {
    ['quyTung', 'kimTin', 'btmc', 'sjc', 'pnj', 'doji'].forEach(k => renderPriceTable(k + 'Prices', k));
}

function updateUnitLabels() {
    const config = UNIT_CONFIG[currentUnit];
    const ud = document.getElementById('unitDescription');
    if (ud) ud.textContent = "Giá theo " + config.label;
    document.querySelectorAll('.price-table th .unit').forEach(el => el.textContent = config.shortLabel);
}

function updateLastUpdateTime() {
    const el = document.getElementById('lastUpdate');
    if (el) el.textContent = LAST_UPDATE;
}

function initUnitSwitcher() {
    document.querySelectorAll('.unit-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.unit-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentUnit = this.dataset.unit;
            renderAllTables();
            updateUnitLabels();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initUnitSwitcher();
    renderAllTables();
    updateUnitLabels();
    updateLastUpdateTime();
});
