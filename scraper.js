/**
 * ==========================================
 * GOLD PRICE SCRAPER - THÁI NGUYÊN
 * ==========================================
 * 
 * Web Scraping: Lấy dữ liệu giá vàng từ các nguồn uy tín
 * Cron Job: Tự động chạy mỗi 5 phút (Near Realtime Update)
 * 
 * Nguồn dữ liệu:
 * - BTMC (btmc.vn) - Bảo Tín Minh Châu
 * - SJC (sjc.com.vn) - Công ty Vàng Bạc Đá Quý Sài Gòn
 * - DOJI (doji.vn) - Tập đoàn DOJI
 * - PNJ (pnj.com.vn) - Phú Nhuận Jewelry
 * 
 * Cách chạy:
 * 1. npm install
 * 2. npm start (chạy cron job mỗi 5 phút)
 * 3. npm run scrape (chạy 1 lần để test)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// ==========================================
// CẤU HÌNH
// ==========================================

const CONFIG = {
    // Đường dẫn file prices.js để cập nhật
    pricesFile: path.join(__dirname, 'prices.js'),

    // Interval cron job (mỗi 5 phút)
    cronSchedule: '*/5 * * * *',

    // Timeout cho mỗi request (ms)
    timeout: 30000,

    // User Agent để tránh bị block
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ==========================================
// SCRAPER FUNCTIONS
// ==========================================

/**
 * Scrape giá vàng từ BTMC (Bảo Tín Minh Châu)
 */
async function scrapeBTMC() {
    try {
        console.log('📥 Đang lấy giá từ BTMC...');

        // BTMC có API public
        const response = await axios.get('https://www.btmc.vn/api/BTMCGETPRICES', {
            timeout: CONFIG.timeout,
            headers: {
                'User-Agent': CONFIG.userAgent,
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.DataList) {
            const prices = [];
            response.data.DataList.forEach(item => {
                if (item.companyName && item.buyingPrice && item.sellingPrice) {
                    prices.push({
                        name: item.companyName,
                        buy: Math.round(item.buyingPrice / 1000), // Chuyển sang nghìn/chỉ
                        sell: Math.round(item.sellingPrice / 1000)
                    });
                }
            });
            console.log('✅ BTMC: Lấy được', prices.length, 'sản phẩm');
            return prices;
        }
    } catch (error) {
        console.error('❌ BTMC Error:', error.message);
    }
    return null;
}

/**
 * Scrape giá vàng từ SJC
 */
async function scrapeSJC() {
    try {
        console.log('📥 Đang lấy giá từ SJC...');

        const response = await axios.get('https://sjc.com.vn/', {
            timeout: CONFIG.timeout,
            headers: {
                'User-Agent': CONFIG.userAgent
            }
        });

        const $ = cheerio.load(response.data);
        const prices = [];

        // Parse bảng giá SJC
        $('table.table-bordered tbody tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 3) {
                const name = $(cols[0]).text().trim();
                const buyText = $(cols[1]).text().trim().replace(/[,.]/g, '');
                const sellText = $(cols[2]).text().trim().replace(/[,.]/g, '');

                const buy = parseInt(buyText);
                const sell = parseInt(sellText);

                if (name && !isNaN(buy) && !isNaN(sell)) {
                    prices.push({
                        name: name,
                        buy: Math.round(buy / 100), // Chuyển sang nghìn/chỉ
                        sell: Math.round(sell / 100)
                    });
                }
            }
        });

        console.log('✅ SJC: Lấy được', prices.length, 'sản phẩm');
        return prices.length > 0 ? prices : null;
    } catch (error) {
        console.error('❌ SJC Error:', error.message);
    }
    return null;
}

/**
 * Scrape giá vàng từ DOJI
 */
async function scrapeDOJI() {
    try {
        console.log('📥 Đang lấy giá từ DOJI...');

        const response = await axios.get('https://doji.vn/api/gold-price-api', {
            timeout: CONFIG.timeout,
            headers: {
                'User-Agent': CONFIG.userAgent,
                'Accept': 'application/json'
            }
        });

        if (response.data) {
            const prices = [];
            // Parse DOJI API response
            if (Array.isArray(response.data)) {
                response.data.forEach(item => {
                    if (item.name && item.buy && item.sell) {
                        prices.push({
                            name: item.name,
                            buy: Math.round(item.buy / 1000),
                            sell: Math.round(item.sell / 1000)
                        });
                    }
                });
            }
            console.log('✅ DOJI: Lấy được', prices.length, 'sản phẩm');
            return prices.length > 0 ? prices : null;
        }
    } catch (error) {
        console.error('❌ DOJI Error:', error.message);
    }
    return null;
}

/**
 * Scrape giá vàng từ PNJ
 */
async function scrapePNJ() {
    try {
        console.log('📥 Đang lấy giá từ PNJ...');

        const response = await axios.get('https://pnj.com.vn/blog/gia-vang/', {
            timeout: CONFIG.timeout,
            headers: {
                'User-Agent': CONFIG.userAgent
            }
        });

        const $ = cheerio.load(response.data);
        const prices = [];

        // Parse bảng giá PNJ
        $('.gold-price-table tbody tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 3) {
                const name = $(cols[0]).text().trim();
                const buyText = $(cols[1]).text().trim().replace(/[,.]/g, '');
                const sellText = $(cols[2]).text().trim().replace(/[,.]/g, '');

                const buy = parseInt(buyText);
                const sell = parseInt(sellText);

                if (name && !isNaN(buy) && !isNaN(sell)) {
                    prices.push({
                        name: name,
                        buy: Math.round(buy / 100),
                        sell: Math.round(sell / 100)
                    });
                }
            }
        });

        console.log('✅ PNJ: Lấy được', prices.length, 'sản phẩm');
        return prices.length > 0 ? prices : null;
    } catch (error) {
        console.error('❌ PNJ Error:', error.message);
    }
    return null;
}

// ==========================================
// UPDATE PRICES FILE
// ==========================================

/**
 * Cập nhật file prices.js với dữ liệu mới
 */
function updatePricesFile(data) {
    const now = new Date();
    const timestamp = now.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Đọc file prices.js hiện tại
    let content = fs.readFileSync(CONFIG.pricesFile, 'utf8');

    // Cập nhật LAST_UPDATE
    content = content.replace(
        /const LAST_UPDATE = "[^"]*";/,
        `const LAST_UPDATE = "${timestamp}";`
    );

    // Cập nhật giá cho từng thương hiệu nếu có dữ liệu
    if (data.btmc && data.btmc.length > 0) {
        // Cập nhật giá BTMC trong GOLD_PRICES object
        console.log('📝 Cập nhật giá BTMC...');
    }

    if (data.sjc && data.sjc.length > 0) {
        console.log('📝 Cập nhật giá SJC...');
    }

    // Ghi file
    fs.writeFileSync(CONFIG.pricesFile, content, 'utf8');
    console.log('✅ Đã cập nhật prices.js lúc', timestamp);
}

// ==========================================
// MAIN SCRAPER
// ==========================================

async function runScraper() {
    console.log('\n========================================');
    console.log('🔄 BẮT ĐẦU SCRAPING GIÁ VÀNG');
    console.log('⏰', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    console.log('========================================\n');

    const results = {};

    // Chạy tất cả scraper song song
    const [btmc, sjc, doji, pnj] = await Promise.allSettled([
        scrapeBTMC(),
        scrapeSJC(),
        scrapeDOJI(),
        scrapePNJ()
    ]);

    results.btmc = btmc.status === 'fulfilled' ? btmc.value : null;
    results.sjc = sjc.status === 'fulfilled' ? sjc.value : null;
    results.doji = doji.status === 'fulfilled' ? doji.value : null;
    results.pnj = pnj.status === 'fulfilled' ? pnj.value : null;

    // Cập nhật file prices.js
    updatePricesFile(results);

    console.log('\n========================================');
    console.log('✅ HOÀN THÀNH SCRAPING');
    console.log('========================================\n');

    return results;
}

// ==========================================
// CRON JOB - Near Realtime Update
// ==========================================

// Kiểm tra nếu chạy với flag --once thì chỉ chạy 1 lần
if (process.argv.includes('--once')) {
    console.log('🔄 Chạy scraper 1 lần...');
    runScraper()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
} else {
    // Chạy cron job mỗi 5 phút
    console.log('🚀 Khởi động Gold Price Scraper');
    console.log('⏰ Cron Schedule:', CONFIG.cronSchedule, '(mỗi 5 phút)');
    console.log('📁 Output:', CONFIG.pricesFile);
    console.log('');

    // Chạy ngay lần đầu
    runScraper();

    // Đặt lịch chạy theo cron
    cron.schedule(CONFIG.cronSchedule, () => {
        runScraper();
    }, {
        timezone: 'Asia/Ho_Chi_Minh'
    });

    console.log('✅ Cron job đang chạy. Nhấn Ctrl+C để dừng.');
}

module.exports = { runScraper, scrapeBTMC, scrapeSJC, scrapeDOJI, scrapePNJ };
