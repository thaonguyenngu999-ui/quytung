// ==========================================
// INITIALIZE LUCIDE ICONS
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Update time immediately
    updateTime();

    // Initialize animations
    initAnimations();
});

// ==========================================
// REAL-TIME CLOCK UPDATE
// ==========================================

function updateTime() {
    const now = new Date();

    // Format time (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Format date (Vietnamese style)
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${dayName}, ${day}/${month}/${year}`;

    // Update DOM elements
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');
    const updateTimeElement = document.getElementById('updateTime');

    if (timeElement) timeElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
    if (updateTimeElement) updateTimeElement.textContent = timeString;
}

// Update time every second
setInterval(updateTime, 1000);

// ==========================================
// PAGE ANIMATIONS
// ==========================================

function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 50);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.price-section, .info-card, .brand-card').forEach(el => {
        el.classList.add('animate-ready');
        observer.observe(el);
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-ready {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ==========================================
// PRICE ROW HOVER EFFECTS
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    const priceRows = document.querySelectorAll('.price-row');

    priceRows.forEach(row => {
        row.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.2s ease';
        });
    });
});

// ==========================================
// MOBILE MENU (if needed)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            // Toggle mobile menu logic here if needed
            console.log('Mobile menu clicked');
        });
    }
});

// ==========================================
// SMOOTH SCROLL
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==========================================
// PRICE UPDATE SIMULATION
// ==========================================

function simulatePriceFlash() {
    const prices = document.querySelectorAll('.price-value');
    prices.forEach(price => {
        price.style.transition = 'all 0.3s ease';
        price.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';

        setTimeout(() => {
            price.style.textShadow = '';
        }, 300);
    });
}

// ==========================================
// CONSOLE BRANDING
// ==========================================

console.log('%c🏆 Giá Vàng Quý Tùng 🏆', 'color: #FFD700; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px #8B0000;');
console.log('%cWebsite đang hoạt động tốt!', 'color: #22c55e; font-size: 14px;');
console.log('%cCập nhật giá vàng chính xác và uy tín', 'color: #fcd34d; font-size: 12px;');
