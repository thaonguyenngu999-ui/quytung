const puppeteer = require('puppeteer');
const fs = require('fs');

// Cấu hình
const CONFIG = {
    timeout: 60000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Giá mặc định (fallback)
let currentPrices = {
    lastUpdate: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    quyTung: {
        nhanTronTron: { buy: 16702, sell: 17298 },
        nhanEpVi: { buy: 16702, sell: 17298 },
        sjc: { buy: 17602, sell: 18160 },
        trangSuc18K: { buy: 12480, sell: 12960 }
    },
    kimTin: {
        nhanTronTron: { buy: 16702, sell: 17298 },
        nhanEpVi: { buy: 16702, sell: 17298 },
        quaMung: { buy: 16702, sell: 17298 },
        sjc: { buy: 17602, sell: 18160 },
        trangSuc18K: { buy: 12480, sell: 12960 }
    },
    btmc: {
        nhanTron: { buy: 16700, sell: 17300 },
        nhanRongPhung: { buy: 16700, sell: 17350 },
        sjc: { buy: 17600, sell: 18150 }
    },
    sjc: {
        sjc1L: { buy: 17600, sell: 18160 },
        nhan9999: { buy: 16680, sell: 17280 },
        nuTrang: { buy: 16580, sell: 17180 }
    },
    pnj: {
        sjc: { buy: 17600, sell: 18150 },
        nhan24K: { buy: 16650, sell: 17250 }
    },
    doji: {
        hungThinhVuong: { buy: 17590, sell: 18140 },
        nhanTron: { buy: 16680, sell: 17280 }
    }
};

async function fetchExternalAPI() {
    try {
        console.log('📡 Đang gọi API: https://apigold.vercel.app/api/gold-prices ...');
        const response = await fetch('https://apigold.vercel.app/api/gold-prices');
        const json = await response.json();

        if (json && json.data) {
            console.log('✅ API: Lấy dữ liệu thành công');

            // Hàm chuẩn hóa giá (xử lý số lẻ như 17.8)
            const normalize = (val) => {
                if (!val) return 0;
                let num = parseFloat(val);
                if (num < 100) num = num * 1000; // 17.8 -> 17800
                return Math.round(num);
            };

            for (const item of json.data) {
                const source = item.source?.toLowerCase();
                const data = item.data || [];

                if (source.includes('doji')) {
                    data.forEach(p => {
                        const name = p.name?.toLowerCase() || '';
                        if (name.includes('hưng thịnh') || (name.includes('nhẫn') && name.includes('tròn'))) {
                            currentPrices.doji.hungThinhVuong.buy = normalize(p.buy);
                            currentPrices.doji.hungThinhVuong.sell = normalize(p.sell);
                            currentPrices.doji.nhanTron.buy = normalize(p.buy);
                            currentPrices.doji.nhanTron.sell = normalize(p.sell);
                        }
                    });
                }
                if (source.includes('btmc')) {
                    data.forEach(p => {
                        const name = p.name?.toLowerCase() || '';
                        if (name.includes('nhẫn') && name.includes('tròn')) {
                            currentPrices.btmc.nhanTron.buy = normalize(p.buy);
                            currentPrices.btmc.nhanTron.sell = normalize(p.sell);
                        }
                        if (name.includes('sjc')) {
                            currentPrices.btmc.sjc.buy = normalize(p.buy);
                            currentPrices.btmc.sjc.sell = normalize(p.sell);
                        }
                    });
                }
                if (source.includes('sjc')) {
                    data.forEach(p => {
                        const name = p.name?.toLowerCase() || '';
                        if (name.includes('sjc') && (name.includes('1l') || name.includes('miếng'))) {
                            currentPrices.sjc.sjc1L.buy = normalize(p.buy);
                            currentPrices.sjc.sjc1L.sell = normalize(p.sell);
                        }
                    });
                }
            }
            return true;
        }
    } catch (e) {
        console.log('⚠️ API: Lỗi hoặc Timeout -', e.message);
    }
    return false;
}

async function scrapeData() {
    console.log('🚀 Khởi động Browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setUserAgent(CONFIG.userAgent);
    await page.setViewport({ width: 1366, height: 768 });

    // ==========================================
    // 1. LẤY GIÁ KIM TÍN (QUÉT TRỰC TIẾP THEO YÊU CẦU)
    // ==========================================
    try {
        console.log('📡 Truy cập Kim Tín (Scraper)...');
        await page.goto('https://kimtin.vn/bieu-do-gia-vang', { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

        const kimTinData = await page.evaluate(() => {
            const results = { nhanTron: null, sjc: null, trangSuc18K: null };
            const rows = document.querySelectorAll('.table-price table tbody tr');

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                // Cấu hình bảng: Thương phẩm | Loại vàng | Hàm lượng | Mua vào | Bán ra
                // Nhưng có rowspan nên số lượng cell thay đổi

                let typeText = "";
                let buyIdx = -1;
                let sellIdx = -1;

                if (cells.length === 5) {
                    typeText = cells[1].innerText.toUpperCase();
                    buyIdx = 3;
                    sellIdx = 4;
                } else if (cells.length === 4) {
                    typeText = cells[0].innerText.toUpperCase();
                    buyIdx = 2;
                    sellIdx = 3;
                }

                if (buyIdx !== -1) {
                    const buy = parseInt(cells[buyIdx].innerText.replace(/\D/g, ''));
                    const sell = parseInt(cells[sellIdx].innerText.replace(/\D/g, ''));

                    if (typeText.includes('NHẪN TRÒN')) {
                        results.nhanTron = { buy, sell };
                    } else if (typeText.includes('VÀNG MIẾNG SJC')) {
                        results.sjc = { buy, sell };
                    } else if (typeText.includes('TRANG SỨC') && typeText.includes('750')) {
                        results.trangSuc18K = { buy, sell };
                    }
                }
            });
            return results;
        });

        if (kimTinData.nhanTron) {
            currentPrices.kimTin.nhanTronTron = kimTinData.nhanTron;
            currentPrices.kimTin.nhanEpVi = kimTinData.nhanTron;
            currentPrices.kimTin.quaMung = kimTinData.nhanTron;
            console.log('✅ Kim Tín: Đã cập nhật Nhẫn Tròn');
        }
        if (kimTinData.sjc) {
            currentPrices.kimTin.sjc = kimTinData.sjc;
            console.log('✅ Kim Tín: Đã cập nhật SJC');
        }
        if (kimTinData.trangSuc18K) {
            currentPrices.kimTin.trangSuc18K = kimTinData.trangSuc18K;
            console.log('✅ Kim Tín: Đã cập nhật Trang sức 18K');
        }
    } catch (e) {
        console.log('⚠️ Kim Tín: Lỗi Scraper -', e.message);
    }

    // ==========================================
    // 2. LẤY GIÁ SJC (DỰ PHÒNG NẾU API LỖI)
    // ==========================================
    if (!currentPrices.sjc.sjc1L.buy) {
        try {
            console.log('📡 Truy cập SJC (Fallback Scraper)...');
            await page.goto('https://sjc.com.vn/giavang/textContent.php', { waitUntil: 'domcontentloaded' });

            const sjcData = await page.evaluate(() => {
                const prices = { sjc1L: {}, nhan9999: {}, nuTrang: {} };
                const rows = document.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 3) {
                        const name = cells[0].innerText.toLowerCase();
                        const buy = parseInt(cells[1].innerText.replace(/\D/g, ''));
                        const sell = parseInt(cells[2].innerText.replace(/\D/g, ''));
                        if (!isNaN(buy) && !isNaN(sell)) {
                            if (name.includes('sjc') && name.includes('1l')) prices.sjc1L = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                            if (name.includes('nhẫn') && name.includes('99.99')) prices.nhan9999 = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                            if (name.includes('nữ trang') && name.includes('99.99')) prices.nuTrang = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                        }
                    }
                });
                return prices;
            });
            if (sjcData.sjc1L.buy) {
                currentPrices.sjc = { ...currentPrices.sjc, ...sjcData };
                console.log('✅ SJC: Cập nhật thành công (Scraper)');
            }
        } catch (e) { console.log('⚠️ SJC Scraper: Lỗi -', e.message); }
    }

    await browser.close();
}

// ==========================================
// CẬP NHẬT GIÁ CHO QUÝ TÙNG & KIM TÍN (THEO BIÊN ĐỘ KIM TÍN)
// ==========================================
function syncLocalPrices() {
    // Kim Tín là mốc tiêu chuẩn (Base)
    const kt = currentPrices.kimTin;

    // Hàm áp dụng biên độ (Margin)
    // Buy = Base - Margin, Sell = Base + Margin
    // Margin chuyển đổi từ VND (vd 20.000) sang đơn vị của web (chia 1000 -> 20)
    const applyMargin = (base, marginVnd) => {
        const margin = marginVnd / 1000;
        return {
            buy: base.buy > 0 ? base.buy - margin : 0,
            sell: base.sell > 0 ? base.sell + margin : 0
        };
    };

    // 1. QUÝ TÙNG (Biên độ A: 20.000đ)
    const marginA = 20000;
    currentPrices.quyTung.nhanTronTron = applyMargin(kt.nhanTronTron, marginA);
    currentPrices.quyTung.nhanEpVi = applyMargin(kt.nhanEpVi, marginA);
    currentPrices.quyTung.sjc = applyMargin(kt.sjc, marginA);
    currentPrices.quyTung.trangSuc18K = applyMargin(kt.trangSuc18K, marginA);

    // 2. BTMC & SJC (Biên độ B: 35.000đ)
    const marginB = 35000;
    // BTMC
    currentPrices.btmc.nhanTron = applyMargin(kt.nhanTronTron, marginB);
    currentPrices.btmc.sjc = applyMargin(kt.sjc, marginB);
    // SJC
    currentPrices.sjc.sjc1L = applyMargin(kt.sjc, marginB);
    currentPrices.sjc.nhan9999 = applyMargin(kt.nhanTronTron, marginB);
    currentPrices.sjc.nuTrang = applyMargin(kt.trangSuc18K, marginB);

    // 3. DOJI & PNJ (Biên độ C: 50.000đ)
    const marginC = 50000;
    // DOJI
    currentPrices.doji.hungThinhVuong = applyMargin(kt.sjc, marginC);
    currentPrices.doji.nhanTron = applyMargin(kt.nhanTronTron, marginC);
    // PNJ
    currentPrices.pnj.sjc = applyMargin(kt.sjc, marginC);
    currentPrices.pnj.nhan24K = applyMargin(kt.nhanTronTron, marginC);

    console.log('🔄 Đã đồng bộ giá toàn bộ website theo biên độ Kim Tín (20k-50k)');
}

function writePricesFile() {
    const now = new Date();
    const vnTime = now.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const pricesContent = `// ==========================================
// GIÁ VÀNG THÁI NGUYÊN - TỰ ĐỘNG CẬP NHẬT (Browser)
// Nguồn: BTMC, SJC, DOJI + tham khảo Kim Tín
// ==========================================

// Thời gian cập nhật giá cuối cùng
const LAST_UPDATE = "${vnTime}";

// ==========================================
// GIÁ VÀNG THAM KHẢO - ĐƠN VỊ: 1.000đ/chỉ
// ==========================================

const GOLD_PRICES = {
    quyTung: {
        name: "Vàng Bạc Quý Tùng",
        address: "142 Lương Ngọc Quyến, TP. Thái Nguyên",
        phone: "",
        website: "",
        products: [
            { name: "Nhẫn tròn trơn", desc: "Vàng 999.9 nguyên chất", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.quyTung.nhanTronTron.buy}, sell: ${currentPrices.quyTung.nhanTronTron.sell} },
            { name: "Nhẫn tròn ép vỉ", desc: "Vàng 999.9 nguyên chất", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.quyTung.nhanEpVi.buy}, sell: ${currentPrices.quyTung.nhanEpVi.sell} },
            { name: "Vàng miếng SJC", desc: "Vàng miếng chính hãng SJC", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.quyTung.sjc.buy}, sell: ${currentPrices.quyTung.sjc.sell} },
            { name: "Trang sức 18K", desc: "Trang sức vàng 750", purity: "750", purityLabel: "18K", buy: ${currentPrices.quyTung.trangSuc18K.buy}, sell: ${currentPrices.quyTung.trangSuc18K.sell} }
        ]
    },
    kimTin: {
        name: "Tập Đoàn Kim Tín",
        address: "56 Lương Ngọc Quyến, TP. Thái Nguyên",
        phone: "",
        website: "kimtin.vn",
        products: [
            { name: "Nhẫn tròn trơn", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.kimTin.nhanTronTron.buy}, sell: ${currentPrices.kimTin.nhanTronTron.sell} },
            { name: "Nhẫn tròn ép vỉ", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.kimTin.nhanEpVi.buy}, sell: ${currentPrices.kimTin.nhanEpVi.sell} },
            { name: "Quà mừng vàng", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.kimTin.quaMung.buy}, sell: ${currentPrices.kimTin.quaMung.sell} },
            { name: "Vàng miếng SJC", desc: "Vàng miếng chính hãng SJC", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.kimTin.sjc.buy}, sell: ${currentPrices.kimTin.sjc.sell} },
            { name: "Trang sức 18K", desc: "Trang sức vàng 750", purity: "750", purityLabel: "18K", buy: ${currentPrices.kimTin.trangSuc18K.buy}, sell: ${currentPrices.kimTin.trangSuc18K.sell} }
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
            { name: "Nhẫn Trơn 999.9", desc: "Vàng nhẫn tròn trơn BTMC", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.btmc.nhanTron.buy}, sell: ${currentPrices.btmc.nhanTron.sell} },
            { name: "Nhẫn Rồng Phụng", desc: "Vàng nhẫn họa tiết BTMC", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.btmc.nhanRongPhung.buy}, sell: ${currentPrices.btmc.nhanRongPhung.sell} },
            { name: "Vàng miếng SJC", desc: "Vàng miếng SJC chính hãng", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.btmc.sjc.buy}, sell: ${currentPrices.btmc.sjc.sell} }
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
            { name: "Vàng miếng SJC 1L", desc: "Vàng miếng SJC 1 lượng", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.sjc.sjc1L.buy}, sell: ${currentPrices.sjc.sjc1L.sell} },
            { name: "Vàng nhẫn SJC 99.99", desc: "Nhẫn tròn trơn SJC", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.sjc.nhan9999.buy}, sell: ${currentPrices.sjc.nhan9999.sell} },
            { name: "Vàng nữ trang 99.99", desc: "Trang sức vàng 24K", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.sjc.nuTrang.buy}, sell: ${currentPrices.sjc.nuTrang.sell} }
        ]
    },
    pnj: {
        name: "PNJ",
        address: "Vincom Thái Nguyên",
        phone: "1800.54.54.57",
        website: "pnj.com.vn",
        hasApi: false,
        products: [
            { name: "Vàng miếng SJC", desc: "Vàng miếng SJC chính hãng", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.pnj.sjc.buy}, sell: ${currentPrices.pnj.sjc.sell} },
            { name: "Nhẫn tròn PNJ 24K", desc: "Nhẫn vàng 999.9 PNJ", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.pnj.nhan24K.buy}, sell: ${currentPrices.pnj.nhan24K.sell} }
        ]
    },
    doji: {
        name: "DOJI",
        address: "Toàn quốc",
        phone: "1800.1168",
        website: "doji.vn",
        hasApi: false,
        products: [
            { name: "Hưng Thịnh Vượng", desc: "Vàng miếng DOJI", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.doji.hungThinhVuong.buy}, sell: ${currentPrices.doji.hungThinhVuong.sell} },
            { name: "Nhẫn tròn DOJI", desc: "Nhẫn vàng 999.9 DOJI", purity: "999.9", purityLabel: "24K", buy: ${currentPrices.doji.nhanTron.buy}, sell: ${currentPrices.doji.nhanTron.sell} }
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
        row.className = \`price-row\${index === 0 ? ' highlight' : ''}\${item.name.includes('SJC') ? ' sjc-row' : ''}\`;
        row.innerHTML = \`
            <td class="product-info">
                <div class="product-name-main">\${item.name.toUpperCase()}</div>
                <div class="product-desc">\${item.desc}</div>
            </td>
            <td class="purity">
                <span class="purity-value">\${item.purity}</span>
                <span class="purity-label">(\${item.purityLabel})</span>
            </td>
            <td class="price buy-price">
                <span class="price-value">\${formatPrice(convertPrice(item.buy, currentUnit))}</span>
            </td>
            <td class="price sell-price">
                <span class="price-value">\${formatPrice(convertPrice(item.sell, currentUnit))}</span>
            </td>
        \`;
        c.appendChild(row);
    });
}

function renderAllTables() {
    ['quyTung', 'kimTin', 'btmc', 'sjc', 'pnj', 'doji'].forEach(k => renderPriceTable(k + 'Prices', k));
}

function updateUnitLabels() {
    const config = UNIT_CONFIG[currentUnit];
    const ud = document.getElementById('unitDescription');
    if (ud) ud.textContent = \`Giá theo \${config.label}\`;
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
\`;

    fs.writeFileSync('prices.js', pricesContent, 'utf8');
    console.log('📝 Đã ghi file prices.js');
}

// ==========================================
// MAIN
// ==========================================
async function main() {
    console.log('🚀 Bắt đầu lấy giá vàng...');
    console.log('⏰ Thời gian:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    console.log('');

    // 1. Thử lấy từ API trước (Nhanh & Nhẹ)
    await fetchExternalAPI();

    // 2. Lấy bằng Scraper (Dự phòng & Kim Tín đặc thù)
    await scrapeData();

    // 3. Đồng bộ giá các cửa hàng địa phương
    syncLocalPrices();

    // 4. Ghi file kết quả
    writePricesFile();

    console.log('');
    console.log('✅ Hoàn thành cập nhật giá!');
    process.exit(0);
}

main().catch(error => {
    console.error('❌ Lỗi Fatal:', error);
    process.exit(1);
});
