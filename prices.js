// ==========================================
// GIÁ VÀNG THÁI NGUYÊN - TỰ ĐỘNG CẬP NHẬT
// Nguồn: BTMC, SJC, DOJI + tham khảo Kim Tín
// ==========================================

const LAST_UPDATE = "05:59 15/02/2026";

const GOLD_PRICES = {
    "quyTung": {
        "name": "Vàng Bạc Quý Tùng",
        "address": "142 Lương Ngọc Quyến, TP. Thái Nguyên",
        "phone": "",
        "website": "",
        "products": [
            {
                "name": "Nhẫn tròn trơn",
                "desc": "Vàng 999.9 nguyên chất",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16682,
                "sell": 17318
            },
            {
                "name": "Nhẫn tròn ép vỉ",
                "desc": "Vàng 999.9 nguyên chất",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16682,
                "sell": 17318
            },
            {
                "name": "Vàng miếng SJC",
                "desc": "Vàng miếng chính hãng SJC",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 17582,
                "sell": 18180
            },
            {
                "name": "Trang sức 18K",
                "desc": "Trang sức vàng 750",
                "purity": "750",
                "purityLabel": "18K",
                "buy": 12460,
                "sell": 12980
            }
        ]
    },
    "kimTin": {
        "name": "Tập Đoàn Kim Tín",
        "address": "56 Lương Ngọc Quyến, TP. Thái Nguyên",
        "phone": "",
        "website": "kimtin.vn",
        "products": [
            {
                "name": "Nhẫn tròn trơn",
                "desc": "Vàng Rồng Kim Tín 999.9",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16702,
                "sell": 17298
            },
            {
                "name": "Nhẫn tròn ép vỉ",
                "desc": "Vàng Rồng Kim Tín 999.9",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16702,
                "sell": 17298
            },
            {
                "name": "Quà mừng vàng",
                "desc": "Vàng Rồng Kim Tín 999.9",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16702,
                "sell": 17298
            },
            {
                "name": "Vàng miếng SJC",
                "desc": "Vàng miếng chính hãng SJC",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 17602,
                "sell": 18160
            },
            {
                "name": "Trang sức 18K",
                "desc": "Trang sức vàng 750",
                "purity": "750",
                "purityLabel": "18K",
                "buy": 12480,
                "sell": 12960
            }
        ]
    },
    "btmc": {
        "name": "Bảo Tín Minh Châu",
        "address": "Toàn quốc",
        "phone": "1800.599.920",
        "website": "btmc.vn",
        "hasApi": true,
        "apiNote": "Lấy từ BTMC API",
        "products": [
            {
                "name": "Nhẫn Trơn 999.9",
                "desc": "Vàng nhẫn tròn trơn BTMC",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16667,
                "sell": 17333
            },
            {
                "name": "Nhẫn Rồng Phụng",
                "desc": "Vàng nhẫn họa tiết BTMC",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16700,
                "sell": 17350
            },
            {
                "name": "Vàng miếng SJC",
                "desc": "Vàng miếng SJC chính hãng",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 17567,
                "sell": 18195
            }
        ]
    },
    "sjc": {
        "name": "SJC (Vàng Bạc SG)",
        "address": "Toàn quốc",
        "phone": "1900.54.54.78",
        "website": "sjc.com.vn",
        "hasApi": true,
        "apiNote": "Lấy từ SJC",
        "products": [
            {
                "name": "Vàng miếng SJC 1L",
                "desc": "Vàng miếng SJC 1 lượng",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 17567,
                "sell": 18195
            },
            {
                "name": "Vàng nhẫn SJC 99.99",
                "desc": "Nhẫn tròn trơn SJC",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16667,
                "sell": 17333
            },
            {
                "name": "Vàng nữ trang 99.99",
                "desc": "Trang sức vàng 24K",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 12445,
                "sell": 12995
            }
        ]
    },
    "pnj": {
        "name": "PNJ",
        "address": "Vincom Thái Nguyên",
        "phone": "1800.54.54.57",
        "website": "pnj.com.vn",
        "hasApi": false,
        "products": [
            {
                "name": "Vàng miếng SJC",
                "desc": "Vàng miếng SJC chính hãng",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 17552,
                "sell": 18210
            },
            {
                "name": "Nhẫn tròn PNJ 24K",
                "desc": "Nhẫn vàng 999.9 PNJ",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16652,
                "sell": 17348
            }
        ]
    },
    "doji": {
        "name": "DOJI",
        "address": "Toàn quốc",
        "phone": "1800.1168",
        "website": "doji.vn",
        "hasApi": false,
        "products": [
            {
                "name": "Hưng Thịnh Vượng",
                "desc": "Vàng miếng DOJI",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 17552,
                "sell": 18210
            },
            {
                "name": "Nhẫn tròn DOJI",
                "desc": "Nhẫn vàng 999.9 DOJI",
                "purity": "999.9",
                "purityLabel": "24K",
                "buy": 16652,
                "sell": 17348
            }
        ]
    }
};
