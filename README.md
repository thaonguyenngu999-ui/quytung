# Gold Price Scraper - Giá Vàng Thái Nguyên

## 📋 Mô tả

Hệ thống tự động lấy giá vàng từ các nguồn uy tín:

- **Web Scraping**: Bot tự động "quét" và trích xuất dữ liệu giá vàng
- **Cron Job**: Tự động chạy mỗi 5 phút
- **Near Realtime Update**: Cập nhật gần như thời gian thực

## 🛠️ Cài đặt

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy scraper với cron job (mỗi 5 phút)
npm start

# 3. Hoặc chạy 1 lần để test
npm run scrape
```

## 📦 Dependencies

- **axios**: HTTP client để gọi API
- **cheerio**: Parse HTML (như jQuery cho Node.js)
- **node-cron**: Lập lịch chạy tự động
- **puppeteer**: Browser automation (nếu cần)

## 🔄 Nguồn dữ liệu

| Nguồn | Website | Phương thức |
|-------|---------|-------------|
| BTMC | btmc.vn | API JSON |
| SJC | sjc.com.vn | HTML Scraping |
| DOJI | doji.vn | API JSON |
| PNJ | pnj.com.vn | HTML Scraping |

## ⏰ Cron Schedule

```
*/5 * * * *
```
= Chạy mỗi 5 phút

## 📁 Output

File `prices.js` sẽ được cập nhật tự động với giá mới nhất.

## 🚀 Deploy (Production)

### Option 1: Chạy local
```bash
npm start
# Để chạy 24/7, sử dụng PM2:
npm install -g pm2
pm2 start scraper.js --name gold-scraper
```

### Option 2: VPS/Server
```bash
# Trên VPS Linux
nohup node scraper.js > scraper.log 2>&1 &
```

### Option 3: Serverless (Vercel/Netlify)
- Sử dụng Vercel Cron Jobs hoặc Netlify Functions

## ⚠️ Lưu ý

- Một số website có thể block scraping
- Respect robots.txt và rate limiting
- Giá chỉ mang tính tham khảo
