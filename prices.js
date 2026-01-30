// ==========================================
// GIÁ VÀNG THÁI NGUYÊN - TỰ ĐỘNG CẬP NHẬT
// Nguồn: BTMC, SJC, DOJI + tham khảo Kim Tín
// ==========================================

// Thời gian cập nhật giá cuối cùng
const LAST_UPDATE = "15:36 30/01/2026";

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
                buy: 16700,
                sell: 17300
            },
            {
                name: "Nhẫn tròn ép vỉ",
                desc: "Vàng 999.9 nguyên chất",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16700,
                sell: 17300
            },
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng chính hãng SJC",
                purity: "999.9",
                purityLabel: "24K",
                buy: 17600,
                sell: 18150
            },
            {
                name: "Trang sức 18K",
                desc: "Trang sức vàng 750",
                purity: "750",
                purityLabel: "18K",
                buy: 12480,
                sell: 12960
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
                buy: 16702,
                sell: 17298
            },
            {
                name: "Nhẫn tròn ép vỉ",
                desc: "Vàng Rồng Kim Tín 999.9",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16702,
                sell: 17298
            },
            {
                name: "Quà mừng vàng",
                desc: "Vàng Rồng Kim Tín 999.9",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16702,
                sell: 17298
            },
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng chính hãng SJC",
                purity: "999.9",
                purityLabel: "24K",
                buy: 17600,
                sell: 18150
            },
            {
                name: "Trang sức 18K",
                desc: "Trang sức vàng 750",
                purity: "750",
                purityLabel: "18K",
                buy: 12480,
                sell: 12960
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
                buy: 16700,
                sell: 17300
            },
            {
                name: "Nhẫn Rồng Phụng",
                desc: "Vàng nhẫn họa tiết BTMC",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16700,
                sell: 17350
            },
            {
                name: "Vàng miếng SJC",
                desc: "Vàng miếng SJC chính hãng",
                purity: "999.9",
                purityLabel: "24K",
                buy: 17600,
                sell: 18150
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
                buy: 17600,
                sell: 18160
            },
            {
                name: "Vàng nhẫn SJC 99.99",
                desc: "Nhẫn tròn trơn SJC",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16680,
                sell: 17280
            },
            {
                name: "Vàng nữ trang 99.99",
                desc: "Trang sức vàng 24K",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16580,
                sell: 17180
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
                buy: 17600,
                sell: 18160
            },
            {
                name: "Nhẫn tròn PNJ 24K",
                desc: "Nhẫn vàng 999.9 PNJ",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16650,
                sell: 17250
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
                buy: 17590,
                sell: 18140
            },
            {
                name: "Nhẫn tròn DOJI",
                desc: "Nhẫn vàng 999.9 DOJI",
                purity: "999.9",
                purityLabel: "24K",
                buy: 16680,
                sell: 17280
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
        row.className = `price-row${index === 0 ? ' highlight' : ''}${item.name.includes('SJC') ? ' sjc-row' : ''}`;
        row.innerHTML = `
            <td class="product-info">
                <div class="product-name-main">${item.name.toUpperCase()}</div>
                <div class="product-desc">${item.desc}</div>
            </td>
            <td class="purity">
                <span class="purity-value">${item.purity}</span>
                <span class="purity-label">(${item.purityLabel})</span>
            </td>
            <td class="price buy-price">
                <span class="price-value">${formatPrice(buyPrice)}</span>
            </td>
            <td class="price sell-price">
                <span class="price-value">${formatPrice(sellPrice)}</span>
            </td>
        `;
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
        unitDesc.textContent = `Giá theo ${config.label}`;
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
