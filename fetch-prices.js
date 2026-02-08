const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// Cấu hình
const CONFIG = {
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Giá mặc định (fallback)
let currentPrices = {
    lastUpdate: "",
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
        const response = await axios.get('https://apigold.vercel.app/api/gold-prices', {
            timeout: 10000,
            httpsAgent: httpsAgent
        });
        const json = response.data;

        if (json && json.data) {
            console.log('✅ API: Lấy dữ liệu thành công');
            const normalize = (val) => {
                if (!val) return 0;
                let num = parseFloat(val);
                if (num < 100) num = num * 1000;
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

async function scrapeKimTin() {
    try {
        console.log('📡 Fetching Kim Tín (Axios/Cheerio)...');
        const response = await axios.get('https://kimtin.vn/bieu-do-gia-vang', {
            headers: { 'User-Agent': CONFIG.userAgent },
            timeout: 10000,
            httpsAgent: httpsAgent
        });

        const $ = cheerio.load(response.data);
        const rows = $('.table-price table tbody tr');

        const results = { nhanTron: null, sjc: null, trangSuc18K: null };

        rows.each((i, row) => {
            const cells = $(row).find('td');
            let typeText = "";
            let buyIdx = -1;
            let sellIdx = -1;

            if (cells.length === 5) {
                typeText = $(cells[1]).text().toUpperCase();
                buyIdx = 3;
                sellIdx = 4;
            } else if (cells.length === 4) {
                typeText = $(cells[0]).text().toUpperCase();
                buyIdx = 2;
                sellIdx = 3;
            }

            if (buyIdx !== -1) {
                const buyText = $(cells[buyIdx]).text();
                const sellText = $(cells[sellIdx]).text();
                const buy = parseInt(buyText.replace(/\D/g, ''));
                const sell = parseInt(sellText.replace(/\D/g, ''));

                if (!isNaN(buy) && !isNaN(sell)) {
                    // console.log(`🔍 Found: ${typeText} | ${buy} - ${sell}`);

                    if (typeText.includes('NHẪN TRÒN')) {
                        results.nhanTron = { buy, sell };
                    } else if (typeText.includes('VÀNG MIẾNG SJC')) {
                        results.sjc = { buy, sell };
                    } else if (typeText.includes('TRANG SỨC') && typeText.includes('750')) {
                        results.trangSuc18K = { buy, sell };
                    }
                }
            }
        });

        if (results.nhanTron) {
            currentPrices.kimTin.nhanTronTron = results.nhanTron;
            currentPrices.kimTin.nhanEpVi = results.nhanTron;
            currentPrices.kimTin.quaMung = results.nhanTron;
            console.log('✅ Kim Tín: Đã cập nhật Nhẫn Tròn');
        }
        if (results.sjc) {
            currentPrices.kimTin.sjc = results.sjc;
            console.log('✅ Kim Tín: Đã cập nhật SJC');
        }
        if (results.trangSuc18K) {
            currentPrices.kimTin.trangSuc18K = results.trangSuc18K;
            console.log('✅ Kim Tín: Đã cập nhật Trang sức 18K');
        }

    } catch (e) {
        console.error('⚠️ Kim Tín Scrape Error:', e.message);
    }
}

function syncLocalPrices() {
    const kt = currentPrices.kimTin;
    const applyMargin = (base, marginVnd) => {
        const margin = marginVnd / 1000;
        return {
            buy: base.buy > 0 ? base.buy - margin : 0,
            sell: base.sell > 0 ? base.sell + margin : 0
        };
    };

    const marginA = 20000;
    currentPrices.quyTung.nhanTronTron = applyMargin(kt.nhanTronTron, marginA);
    currentPrices.quyTung.nhanEpVi = applyMargin(kt.nhanEpVi, marginA);
    currentPrices.quyTung.sjc = applyMargin(kt.sjc, marginA);
    currentPrices.quyTung.trangSuc18K = applyMargin(kt.trangSuc18K, marginA);

    const marginB = 35000;
    currentPrices.btmc.nhanTron = applyMargin(kt.nhanTronTron, marginB);
    currentPrices.btmc.sjc = applyMargin(kt.sjc, marginB);
    currentPrices.sjc.sjc1L = applyMargin(kt.sjc, marginB);
    currentPrices.sjc.nhan9999 = applyMargin(kt.nhanTronTron, marginB);
    currentPrices.sjc.nuTrang = applyMargin(kt.trangSuc18K, marginB);

    const marginC = 50000;
    currentPrices.doji.hungThinhVuong = applyMargin(kt.sjc, marginC);
    currentPrices.doji.nhanTron = applyMargin(kt.nhanTronTron, marginC);
    currentPrices.pnj.sjc = applyMargin(kt.sjc, marginC);
    currentPrices.pnj.nhan24K = applyMargin(kt.nhanTronTron, marginC);
}

function writePricesFile() {
    const vnTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const outputData = {
        quyTung: {
            name: "Vàng Bạc Quý Tùng",
            address: "142 Lương Ngọc Quyến, TP. Thái Nguyên",
            phone: "",
            website: "",
            products: [
                { name: "Nhẫn tròn trơn", desc: "Vàng 999.9 nguyên chất", purity: "999.9", purityLabel: "24K", buy: currentPrices.quyTung.nhanTronTron.buy, sell: currentPrices.quyTung.nhanTronTron.sell },
                { name: "Nhẫn tròn ép vỉ", desc: "Vàng 999.9 nguyên chất", purity: "999.9", purityLabel: "24K", buy: currentPrices.quyTung.nhanEpVi.buy, sell: currentPrices.quyTung.nhanEpVi.sell },
                { name: "Vàng miếng SJC", desc: "Vàng miếng chính hãng SJC", purity: "999.9", purityLabel: "24K", buy: currentPrices.quyTung.sjc.buy, sell: currentPrices.quyTung.sjc.sell },
                { name: "Trang sức 18K", desc: "Trang sức vàng 750", purity: "750", purityLabel: "18K", buy: currentPrices.quyTung.trangSuc18K.buy, sell: currentPrices.quyTung.trangSuc18K.sell }
            ]
        },
        kimTin: {
            name: "Tập Đoàn Kim Tín",
            address: "56 Lương Ngọc Quyến, TP. Thái Nguyên",
            phone: "",
            website: "kimtin.vn",
            products: [
                { name: "Nhẫn tròn trơn", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: currentPrices.kimTin.nhanTronTron.buy, sell: currentPrices.kimTin.nhanTronTron.sell },
                { name: "Nhẫn tròn ép vỉ", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: currentPrices.kimTin.nhanEpVi.buy, sell: currentPrices.kimTin.nhanEpVi.sell },
                { name: "Quà mừng vàng", desc: "Vàng Rồng Kim Tín 999.9", purity: "999.9", purityLabel: "24K", buy: currentPrices.kimTin.quaMung.buy, sell: currentPrices.kimTin.quaMung.sell },
                { name: "Vàng miếng SJC", desc: "Vàng miếng chính hãng SJC", purity: "999.9", purityLabel: "24K", buy: currentPrices.kimTin.sjc.buy, sell: currentPrices.kimTin.sjc.sell },
                { name: "Trang sức 18K", desc: "Trang sức vàng 750", purity: "750", purityLabel: "18K", buy: currentPrices.kimTin.trangSuc18K.buy, sell: currentPrices.kimTin.trangSuc18K.sell }
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
                { name: "Nhẫn Trơn 999.9", desc: "Vàng nhẫn tròn trơn BTMC", purity: "999.9", purityLabel: "24K", buy: currentPrices.btmc.nhanTron.buy, sell: currentPrices.btmc.nhanTron.sell },
                { name: "Nhẫn Rồng Phụng", desc: "Vàng nhẫn họa tiết BTMC", purity: "999.9", purityLabel: "24K", buy: currentPrices.btmc.nhanRongPhung.buy, sell: currentPrices.btmc.nhanRongPhung.sell },
                { name: "Vàng miếng SJC", desc: "Vàng miếng SJC chính hãng", purity: "999.9", purityLabel: "24K", buy: currentPrices.btmc.sjc.buy, sell: currentPrices.btmc.sjc.sell }
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
                { name: "Vàng miếng SJC 1L", desc: "Vàng miếng SJC 1 lượng", purity: "999.9", purityLabel: "24K", buy: currentPrices.sjc.sjc1L.buy, sell: currentPrices.sjc.sjc1L.sell },
                { name: "Vàng nhẫn SJC 99.99", desc: "Nhẫn tròn trơn SJC", purity: "999.9", purityLabel: "24K", buy: currentPrices.sjc.nhan9999.buy, sell: currentPrices.sjc.nhan9999.sell },
                { name: "Vàng nữ trang 99.99", desc: "Trang sức vàng 24K", purity: "999.9", purityLabel: "24K", buy: currentPrices.sjc.nuTrang.buy, sell: currentPrices.sjc.nuTrang.sell }
            ]
        },
        pnj: {
            name: "PNJ",
            address: "Vincom Thái Nguyên",
            phone: "1800.54.54.57",
            website: "pnj.com.vn",
            hasApi: false,
            products: [
                { name: "Vàng miếng SJC", desc: "Vàng miếng SJC chính hãng", purity: "999.9", purityLabel: "24K", buy: currentPrices.pnj.sjc.buy, sell: currentPrices.pnj.sjc.sell },
                { name: "Nhẫn tròn PNJ 24K", desc: "Nhẫn vàng 999.9 PNJ", purity: "999.9", purityLabel: "24K", buy: currentPrices.pnj.nhan24K.buy, sell: currentPrices.pnj.nhan24K.sell }
            ]
        },
        doji: {
            name: "DOJI",
            address: "Toàn quốc",
            phone: "1800.1168",
            website: "doji.vn",
            hasApi: false,
            products: [
                { name: "Hưng Thịnh Vượng", desc: "Vàng miếng DOJI", purity: "999.9", purityLabel: "24K", buy: currentPrices.doji.hungThinhVuong.buy, sell: currentPrices.doji.hungThinhVuong.sell },
                { name: "Nhẫn tròn DOJI", desc: "Nhẫn vàng 999.9 DOJI", purity: "999.9", purityLabel: "24K", buy: currentPrices.doji.nhanTron.buy, sell: currentPrices.doji.nhanTron.sell }
            ]
        }
    };

    const pricesContent = `// ==========================================
// GIÁ VÀNG THÁI NGUYÊN - TỰ ĐỘNG CẬP NHẬT
// Nguồn: BTMC, SJC, DOJI + tham khảo Kim Tín
// ==========================================

const LAST_UPDATE = "${vnTime}";

const GOLD_PRICES = ${JSON.stringify(outputData, null, 4)};
`;
    // Write back to prices.js exactly as index.html expects
    fs.writeFileSync('prices.js', pricesContent, 'utf8');
}

async function main() {
    console.log('🚀 Bắt đầu lấy giá vàng (Lite Mode)...');
    await fetchExternalAPI();
    await scrapeKimTin();
    syncLocalPrices();
    writePricesFile();
    console.log('✅ Hoàn thành cập nhật giá!');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
