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
    // 1. LẤY GIÁ KIM TÍN
    // ==========================================
    try {
        console.log('📡 Truy cập Kim Tín...');
        await page.goto('https://kimtin.vn/bieu-do-gia-vang', { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

        console.log('✅ Kim Tín: Đã truy cập xong');
    } catch (e) {
        console.log('⚠️ Kim Tín: Lỗi -', e.message);
    }

    // ==========================================
    // 2. LẤY GIÁ BTMC (API)
    // ==========================================
    try {
        console.log('📡 Truy cập API BTMC...');
        const btmcData = await page.evaluate(async () => {
            try {
                const res = await fetch('https://www.btmc.vn/api/BTMCGETPRICES');
                const json = await res.json();
                return json.DataList?.Data || [];
            } catch (e) { return []; }
        });

        if (btmcData.length > 0) {
            for (const item of btmcData) {
                const name = item.name?.toLowerCase() || '';
                if (name.includes('nhẫn') && name.includes('tròn') && name.includes('999')) {
                    currentPrices.btmc.nhanTron.buy = Math.round(item.buy / 10);
                    currentPrices.btmc.nhanTron.sell = Math.round(item.sell / 10);
                }
                if (name.includes('sjc') && name.includes('1l')) {
                    currentPrices.btmc.sjc.buy = Math.round(item.buy / 10);
                    currentPrices.btmc.sjc.sell = Math.round(item.sell / 10);
                }
            }
            console.log('✅ BTMC: Thành công');
        }
    } catch (e) {
        console.log('⚠️ BTMC: Lỗi -', e.message);
    }

    // ==========================================
    // 3. LẤY GIÁ SJC
    // ==========================================
    try {
        console.log('📡 Truy cập SJC...');
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
                        if (name.includes('sjc') && name.includes('1l')) {
                            prices.sjc1L = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                        }
                        if (name.includes('nhẫn') && name.includes('99.99')) {
                            prices.nhan9999 = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                        }
                        if (name.includes('nữ trang') && name.includes('99.99')) {
                            prices.nuTrang = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                        }
                    }
                }
            });
            return prices;
        });

        if (sjcData.sjc1L.buy) currentPrices.sjc = { ...currentPrices.sjc, ...sjcData };
        console.log('✅ SJC: Thành công');
    } catch (e) {
        console.log('⚠️ SJC: Lỗi -', e.message);
    }

    // ==========================================
    // 4. LẤY GIÁ DOJI
    // ==========================================
    try {
        console.log('📡 Truy cập DOJI...');
        await page.goto('http://giavang.doji.vn/', { waitUntil: 'networkidle2' });

        const dojiData = await page.evaluate(() => {
            const prices = { hungThinhVuong: {}, nhanTron: {} };
            const rows = document.querySelectorAll('table tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) {
                    const buy = parseInt(cells[2]?.innerText.replace(/\D/g, '')) || 0;
                    const sell = parseInt(cells[3]?.innerText.replace(/\D/g, '')) || 0;

                    if (text.includes('hưng thịnh')) {
                        prices.hungThinhVuong = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                    }
                    if (text.includes('nhẫn') && text.includes('tròn')) {
                        prices.nhanTron = { buy: Math.round(buy / 10), sell: Math.round(sell / 10) };
                    }
                }
            });
            return prices;
        });

        if (dojiData.hungThinhVuong.buy) currentPrices.doji.hungThinhVuong = dojiData.hungThinhVuong;
        if (dojiData.nhanTron.buy) currentPrices.doji.nhanTron = dojiData.nhanTron;
        console.log('✅ DOJI: Thành công');
    } catch (e) {
        console.log('⚠️ DOJI: Lỗi -', e.message);
    }

    await browser.close();
}

// ==========================================
// CẬP NHẬT GIÁ CHO QUÝ TÙNG & KIM TÍN
// ==========================================
function syncLocalPrices() {
    // Quý Tùng & Kim Tín thường theo giá BTMC
    const btmcNhan = currentPrices.btmc.nhanTron;
    const btmcSjc = currentPrices.btmc.sjc;

    // Quý Tùng
    currentPrices.quyTung.nhanTronTron = { ...btmcNhan };
    currentPrices.quyTung.nhanEpVi = { ...btmcNhan };
    currentPrices.quyTung.sjc = { ...btmcSjc };

    // Kim Tín (thường có chênh nhẹ)
    currentPrices.kimTin.nhanTronTron = {
        buy: btmcNhan.buy + 2,
        sell: btmcNhan.sell - 2
    };
    currentPrices.kimTin.nhanEpVi = {
        buy: btmcNhan.buy + 2,
        sell: btmcNhan.sell - 2
    };
    currentPrices.kimTin.quaMung = {
        buy: btmcNhan.buy + 2,
        sell: btmcNhan.sell - 2
    };
    currentPrices.kimTin.sjc = { ...btmcSjc };

    // PNJ
    if (currentPrices.sjc.sjc1L.buy) {
        currentPrices.pnj.sjc = { ...currentPrices.sjc.sjc1L };
        currentPrices.pnj.nhan24K = {
            buy: currentPrices.sjc.nhan9999.buy - 30,
            sell: currentPrices.sjc.nhan9999.sell - 30
        };
    }

    console.log('🔄 Đã đồng bộ giá Quý Tùng, Kim Tín, PNJ');
}

// ==========================================
// GHI FILE PRICES.JS
// ==========================================
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
    // ==========================================
    // VÀNG QUÝ TÙNG (Tham khảo theo BTMC)
    // Địa chỉ: 142 Lương Ngọc Quyến, TP. Thái Nguyên
    // ==========================================
    quyTung: {
        name: "Vàng Bạc Quý Tùng",
        address: "142 Lương Ngọc Quyến, TP. Thái Nguyên",
        phone: "",
        website: "",
        products: [
            {
                name: "Nhẫn tròn trơn",
                desc: "Vàng 999.9 nguyên chất",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.quyTung.nhanTronTron.buy},
                sell: ${currentPrices.quyTung.nhanTronTron.sell}
            },
            {
                name: "Nhẫn tròn ép vỉ",
                desc: "Vàng 999.9 nguyên chất",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.quyTung.nhanEpVi.buy},
                sell: ${currentPrices.quyTung.nhanEpVi.sell}
            },
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng chính hãng SJC",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.quyTung.sjc.buy},
                sell: ${currentPrices.quyTung.sjc.sell}
            },
            {
                name: "Trang sức 18K",
                desc: "Trang sức vàng 750",
                purity: "750",
                purityLabel: "18K",
                buy: ${currentPrices.quyTung.trangSuc18K.buy},
                sell: ${currentPrices.quyTung.trangSuc18K.sell}
            }
        ]
    },

    // ==========================================
    // TẬP ĐOÀN KIM TÍN
    // Địa chỉ: 56 Lương Ngọc Quyến, TP. Thái Nguyên
    // Website: kimtin.vn
    // ==========================================
    kimTin: {
        name: "Tập Đoàn Kim Tín",
        address: "56 Lương Ngọc Quyến, TP. Thái Nguyên",
        phone: "",
        website: "kimtin.vn",
        products: [
            {
                name: "Nhẫn tròn trơn",
                desc: "Vàng Rồng Kim Tín 999.9",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.kimTin.nhanTronTron.buy},
                sell: ${currentPrices.kimTin.nhanTronTron.sell}
            },
            {
                name: "Nhẫn tròn ép vỉ",
                desc: "Vàng Rồng Kim Tín 999.9",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.kimTin.nhanEpVi.buy},
                sell: ${currentPrices.kimTin.nhanEpVi.sell}
            },
            {
                name: "Quà mừng vàng",
                desc: "Vàng Rồng Kim Tín 999.9",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.kimTin.quaMung.buy},
                sell: ${currentPrices.kimTin.quaMung.sell}
            },
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng chính hãng SJC",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.kimTin.sjc.buy},
                sell: ${currentPrices.kimTin.sjc.sell}
            },
            {
                name: "Trang sức 18K",
                desc: "Trang sức vàng 750",
                purity: "750",
                purityLabel: "18K",
                buy: ${currentPrices.kimTin.trangSuc18K.buy},
                sell: ${currentPrices.kimTin.trangSuc18K.sell}
            }
        ]
    },

    // ==========================================
    // BẢO TÍN MINH CHÂU (BTMC)
    // Website: btmc.vn - Có API chính thức
    // ==========================================
    btmc: {
        name: "Bảo Tín Minh Châu",
        address: "Toàn quốc",
        phone: "1800.599.920",
        website: "btmc.vn",
        hasApi: true,
        apiNote: "Lấy từ BTMC API",
        products: [
            {
                name: "Nhẫn Trơn 999.9",
                desc: "Vàng nhẫn tròn trơn BTMC",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.btmc.nhanTron.buy},
                sell: ${currentPrices.btmc.nhanTron.sell}
            },
            {
                name: "Nhẫn Rồng Phụng",
                desc: "Vàng nhẫn họa tiết BTMC",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.btmc.nhanRongPhung.buy},
                sell: ${currentPrices.btmc.nhanRongPhung.sell}
            },
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng SJC chính hãng",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.btmc.sjc.buy},
                sell: ${currentPrices.btmc.sjc.sell}
            }
        ]
    },

    // ==========================================
    // SJC - CÔNG TY VÀNG BẠC ĐÁ QUÝ SÀI GÒN
    // Website: sjc.com.vn
    // ==========================================
    sjc: {
        name: "SJC (Vàng Bạc SG)",
        address: "Toàn quốc",
        phone: "1900.54.54.78",
        website: "sjc.com.vn",
        hasApi: true,
        apiNote: "Lấy từ SJC",
        products: [
            {
                name: "Vàng miếng SJC 1L",
                desc: "Vàng miếng SJC 1 lượng",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.sjc.sjc1L.buy},
                sell: ${currentPrices.sjc.sjc1L.sell}
            },
            {
                name: "Vàng nhẫn SJC 99.99",
                desc: "Nhẫn tròn trơn SJC",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.sjc.nhan9999.buy},
                sell: ${currentPrices.sjc.nhan9999.sell}
            },
            {
                name: "Vàng nữ trang 99.99",
                desc: "Trang sức vàng 24K",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.sjc.nuTrang.buy},
                sell: ${currentPrices.sjc.nuTrang.sell}
            }
        ]
    },

    // ==========================================
    // PNJ - PHÚ NHUẬN JEWELRY
    // Website: pnj.com.vn
    // ==========================================
    pnj: {
        name: "PNJ",
        address: "Vincom Thái Nguyên",
        phone: "1800.54.54.57",
        website: "pnj.com.vn",
        hasApi: false,
        products: [
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng SJC chính hãng",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.pnj.sjc.buy},
                sell: ${currentPrices.pnj.sjc.sell}
            },
            {
                name: "Nhẫn tròn PNJ 24K",
                desc: "Nhẫn vàng 999.9 PNJ",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.pnj.nhan24K.buy},
                sell: ${currentPrices.pnj.nhan24K.sell}
            }
        ]
    },

    // ==========================================
    // DOJI
    // Website: doji.vn
    // ==========================================
    doji: {
        name: "DOJI",
        address: "Toàn quốc",
        phone: "1800.1168",
        website: "doji.vn",
        hasApi: false,
        products: [
            {
                name: "Hưng Thịnh Vượng",
                desc: "Vàng miếng DOJI",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.doji.hungThinhVuong.buy},
                sell: ${currentPrices.doji.hungThinhVuong.sell}
            },
            {
                name: "Nhẫn tròn DOJI",
                desc: "Nhẫn vàng 999.9 DOJI",
                purity: "999.9",
                purityLabel: "24K",
                buy: ${currentPrices.doji.nhanTron.buy},
                sell: ${currentPrices.doji.nhanTron.sell}
            }
        ]
    }
};

// ==========================================
// HÀM CHUYỂN ĐỔI ĐƠN VỊ
// ==========================================

let currentUnit = 'chi';

const UNIT_CONFIG = {
    chi: {
        multiplier: 1,
        label: '1 Chỉ (3.75g)',
        shortLabel: '/chỉ',
        gramWeight: 3.75
    },
    luong: {
        multiplier: 10,
        label: '1 Lượng (37.5g)',
        shortLabel: '/lượng',
        gramWeight: 37.5
    },
    gram: {
        multiplier: 1 / 3.75,
        label: '1 Gram',
        shortLabel: '/gram',
        gramWeight: 1
    }
};

function convertPrice(pricePerChi, unit) {
    const config = UNIT_CONFIG[unit];
    return Math.round(pricePerChi * config.multiplier);
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN');
}

// ==========================================
// HÀM RENDER BẢNG GIÁ
// ==========================================

function renderPriceTable(containerId, shopKey) {
    const container = document.getElementById(containerId);
    if (!container || !GOLD_PRICES[shopKey]) return;

    const shop = GOLD_PRICES[shopKey];
    const config = UNIT_CONFIG[currentUnit];
    container.innerHTML = '';

    shop.products.forEach((item, index) => {
        const buyPrice = convertPrice(item.buy, currentUnit);
        const sellPrice = convertPrice(item.sell, currentUnit);
        
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
                <span class="price-value">\${formatPrice(buyPrice)}</span>
            </td>
            <td class="price sell-price">
                <span class="price-value">\${formatPrice(sellPrice)}</span>
            </td>
        \`;
        container.appendChild(row);
    });
}

function renderAllTables() {
    renderPriceTable('quyTungPrices', 'quyTung');
    renderPriceTable('kimTinPrices', 'kimTin');
    renderPriceTable('btmcPrices', 'btmc');
    renderPriceTable('sjcPrices', 'sjc');
    renderPriceTable('pnjPrices', 'pnj');
    renderPriceTable('dojiPrices', 'doji');
}

function updateUnitLabels() {
    const config = UNIT_CONFIG[currentUnit];
    
    const unitDesc = document.getElementById('unitDescription');
    if (unitDesc) {
        unitDesc.textContent = \`Giá theo \${config.label}\`;
    }
    
    document.querySelectorAll('.price-table th .unit').forEach(el => {
        el.textContent = config.shortLabel;
    });
}

function updateLastUpdateTime() {
    const el = document.getElementById('lastUpdate');
    if (el) {
        el.textContent = LAST_UPDATE;
    }
}

// ==========================================
// XỬ LÝ UNIT SWITCHER
// ==========================================

function initUnitSwitcher() {
    const tabs = document.querySelectorAll('.unit-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentUnit = this.dataset.unit;
            renderAllTables();
            updateUnitLabels();
        });
    });
}

// ==========================================
// KHỞI TẠO
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    initUnitSwitcher();
    renderAllTables();
    updateUnitLabels();
    updateLastUpdateTime();
});
`;

    fs.writeFileSync('prices.js', pricesContent, 'utf8');
    console.log('📝 Đã ghi file prices.js');
}

// ==========================================
// MAIN
// ==========================================
async function main() {
    console.log('🚀 Bắt đầu lấy giá vàng (Puppeteer)...');
    console.log('⏰ Thời gian:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    console.log('');

    await scrapeData();

    // Đồng bộ giá
    syncLocalPrices();

    // Ghi file
    writePricesFile();

    console.log('');
    console.log('✅ Hoàn thành cập nhật giá!');
    process.exit(0);
}

main().catch(error => {
    console.error('❌ Lỗi Fatal:', error);
    process.exit(1);
});
