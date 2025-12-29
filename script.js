// --- Constants (Seed Data) ---
const SEED_DATA = {
    brands: [
        { id: 'hyundai', name: '현대', logo: 'fas fa-h-square' },
        { id: 'kia', name: '기아', logo: 'fas fa-k' },
        { id: 'genesis', name: '제네시스', logo: 'fas fa-gem' },
        { id: 'benz', name: '벤츠', logo: 'fas fa-star' },
        { id: 'bmw', name: 'BMW', logo: 'fas fa-circle' }
    ],
    cars: [
        { id: 1, brand: 'hyundai', name: '그랜저', grade: '프리미엄', mileage: '10,000km', price: 680000 },
        { id: 2, brand: 'hyundai', name: '싼타페', grade: '익스클루시브', mileage: '15,000km', price: 720000 },
        { id: 3, brand: 'hyundai', name: '아반떼', grade: '모던', mileage: '5,000km', price: 380000 },
        { id: 4, brand: 'kia', name: '쏘렌토', grade: '노블레스', mileage: '10,000km', price: 710000 },
        { id: 5, brand: 'kia', name: '스포티지', grade: '시그니처', mileage: '20,000km', price: 550000 },
        { id: 6, brand: 'genesis', name: 'G80', grade: '2.5T', mileage: '10,000km', price: 1200000 },
        { id: 7, brand: 'genesis', name: 'GV70', grade: '스포츠', mileage: '12,000km', price: 1100000 },
        { id: 8, brand: 'benz', name: 'E-Class', grade: 'E250', mileage: '10,000km', price: 1500000 },
        { id: 9, brand: 'bmw', name: '5 Series', grade: '520i', mileage: '10,000km', price: 1450000 }
    ]
};

// --- LocalStorage Logic ---
// --- Image Assets (External Reliable URLs) ---
const CAR_IMAGES = {
    1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Hyundai_Grandeur_Calligraphy_GN7_Abyss_Black_Pearl_%282%29.jpg/640px-Hyundai_Grandeur_Calligraphy_GN7_Abyss_Black_Pearl_%282%29.jpg', // Grandeur
    2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/2023_Hyundai_Santa_Fe_PHEV_%28US%29_front_view.jpg/640px-2023_Hyundai_Santa_Fe_PHEV_%28US%29_front_view.jpg', // Santa Fe
    3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Hyundai_Avante_CN7_FL_Meta_Blue_Pearl_%283%29.jpg/640px-Hyundai_Avante_CN7_FL_Meta_Blue_Pearl_%283%29.jpg', // Avante
    4: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Kia_Sorento_MQ4_front_view_%28South_Korea%29_01.png', // Sorento (Transparent)
    5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Kia_Sportage_NQ5_Gravity_Snow_White_Pearl_%281%29.jpg/640px-Kia_Sportage_NQ5_Gravity_Snow_White_Pearl_%281%29.jpg', // Sportage
    6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2017_Genesis_G80_3.8_HTRAC%2C_front_3.18.19.jpg/640px-2017_Genesis_G80_3.8_HTRAC%2C_front_3.18.19.jpg', // G80
    7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Genesis_GV70_JK1_Mauna_Red_%281%29.jpg/640px-Genesis_GV70_JK1_Mauna_Red_%281%29.jpg', // GV70
    8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mercedes-Benz_W213_E_220_d_Exclusive_front_20190722.jpg/640px-Mercedes-Benz_W213_E_220_d_Exclusive_front_20190722.jpg', // E-Class
    9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/BMW_G30_IMG_0058.jpg/640px-BMW_G30_IMG_0058.jpg' // 5 Series
};

// --- LocalStorage Logic ---
function initDB() {
    let data = JSON.parse(localStorage.getItem('carDB') || 'null');

    // Always merge fresh SEED_DATA for critical updates (like missing images)
    if (!data || !data.cars) {
        data = JSON.parse(JSON.stringify(SEED_DATA));
    }

    // Auto-Repair: Inject Images if missing
    if (data.cars) {
        data.cars.forEach(car => {
            if (!car.image || car.image === 'undefined') {
                car.image = CAR_IMAGES[car.id] || 'https://placehold.co/600x400/111827/ffffff.png?text=No+Image';
            }
        });
        localStorage.setItem('carDB', JSON.stringify(data));
    }

    return data;
}

const db = initDB();

// Global State
let currentBrand = 'all';
let currentSearchKeyword = '';
let selectedCar = null;
let timerInterval = null; // To clear interval on transitions
let currentViewingQuoteId = null; // Track currently viewing quote for admin submission

// DOM Elements
const brandFilterEl = document.getElementById('brandFilter');
const carListEl = document.getElementById('carList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initBrandFilter();
    searchInCurrentBrand(''); // Initial render
    addEventListeners();
    initLiveCountdown(); // NEW: Live countdown for the blue banner
    initFloatingButtonLogic(); // [V3.4] Init Floating Btn

    // Check local storage for last tab or default to home
    switchTab('nav-home');
});

// --- NAVIGATION & TABS (SPA) ---

window.switchTab = function (tabId, event) {
    if (event) event.preventDefault();

    // 1. Update Bottom Nav UI
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById(tabId);
    if (navItem) navItem.classList.add('active');

    // 2. Hide all Views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

    // 3. Logic per Tab
    const fabWrapper = document.querySelector('.fab-wrapper');
    if (fabWrapper) {
        // Only show FAB on Analysis tab
        fabWrapper.style.display = (tabId === 'nav-analysis') ? 'block' : 'none';

        // Close option list when switching tabs (UI reset)
        if (tabId !== 'nav-analysis') {
            const optionList = document.getElementById('optionList');
            if (optionList) optionList.style.display = 'none';
        }
    }

    if (tabId === 'nav-home') {
        document.getElementById('view-home').classList.remove('hidden');
        window.scrollTo(0, 0);
    }
    else if (tabId === 'nav-analysis') {
        document.getElementById('view-analysis').classList.remove('hidden');
        // If no selected car, we might want to show empty state or redirect
        if (!selectedCar) {
            // Optional: fallback to first car or show empty
            alert('먼저 홈에서 차량을 선택해주세요! 임의로 첫번째 차량을 보여드립니다.');
            if (db.cars.length > 0) {
                renderDetailView(db.cars[0]);
                selectedCar = db.cars[0];
            }
        } else {
            renderDetailView(selectedCar);
        }
        window.scrollTo(0, 0);
    }
    else if (tabId === 'nav-guide') {
        document.getElementById('view-guide').classList.remove('hidden');
        window.scrollTo(0, 0);
    }
    else if (tabId === 'nav-quotes') {
        document.getElementById('view-quotes').classList.remove('hidden');
        renderSavedQuotes();
        window.scrollTo(0, 0);
    }
    else if (tabId === 'nav-reviews') {
        document.getElementById('view-reviews').classList.remove('hidden');
        renderReviews();
        window.scrollTo(0, 0);
    }
    else {
        alert("준비 중인 기능입니다.");
        switchTab('nav-home');
    }
};

window.goToAnalysis = function (carId) {
    selectedCar = db.cars.find(c => c.id == carId);
    if (selectedCar) {
        // Manually trigger tab switch logic without event
        switchTab('nav-analysis');
    }
};

// --- CORE: HOME VIEW LOGIC ---

function initBrandFilter() {
    brandFilterEl.innerHTML = `
        <button class="brand-item active" data-brand="all">
            <span class="brand-name">전체</span>
        </button>
    `;

    db.brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = 'brand-item';
        btn.dataset.brand = brand.id;

        // Check if logoUrl exists, use image; otherwise fallback to icon
        if (brand.logoUrl && brand.logoUrl.trim() !== '') {
            btn.innerHTML = `
                <img src="${brand.logoUrl}" alt="${brand.name}" class="brand-logo-img" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <i class="${brand.logo}" style="display: none;"></i>
            `;
        } else {
            btn.innerHTML = `
                <i class="${brand.logo}"></i>
                <span class="brand-name">${brand.name}</span>
            `;
        }
        brandFilterEl.appendChild(btn);
    });
}

// ====== SEARCH FUNCTIONS ======
function searchInCurrentBrand(keyword) {
    currentSearchKeyword = keyword.trim();

    // 1. Filter by Brand
    let filteredCars = currentBrand === 'all'
        ? db.cars
        : db.cars.filter(car => car.brand === currentBrand);

    // 2. Filter by Keyword
    if (currentSearchKeyword) {
        const searchLower = currentSearchKeyword.toLowerCase();
        filteredCars = filteredCars.filter(car => {
            return (
                car.name.toLowerCase().includes(searchLower) ||
                car.grade.toLowerCase().includes(searchLower)
            );
        });
    }

    // 3. Render & UI Updates
    renderCars(filteredCars);
    updateSearchResultSummary(filteredCars.length);
    toggleClearButton(currentSearchKeyword);
}

window.clearSearch = function () {
    currentSearchKeyword = '';
    const input = document.getElementById('mainSearchInput');
    if (input) input.value = '';
    searchInCurrentBrand('');
}

function updateSearchResultSummary(count) {
    const summaryEl = document.getElementById('searchResultSummary');
    if (!summaryEl) return;

    if (currentSearchKeyword) {
        summaryEl.innerHTML = `
            <i class="fas fa-search"></i>
            '<strong>${currentSearchKeyword}</strong>' 검색 결과
            <span class="count">${count}대</span>
        `;
        summaryEl.classList.add('active');
    } else {
        const brandText = currentBrand === 'all'
            ? '전체'
            : (db.brands.find(b => b.id === currentBrand)?.name || currentBrand);

        summaryEl.innerHTML = `
            <i class="fas fa-car"></i>
            ${brandText} 차량
            <span class="count">${count}대</span>
        `;
        summaryEl.classList.remove('active');
    }
}

function toggleClearButton(keyword) {
    const clearBtn = document.querySelector('.search-clear-btn');
    if (clearBtn) {
        if (keyword) clearBtn.classList.add('visible');
        else clearBtn.classList.remove('visible');
    }
}

function highlightSearchTerm(text, keyword) {
    if (!keyword || !text) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.toString().replace(regex, '<mark class="search-highlight">$1</mark>');
}


function renderCars(cars) {
    const filteredCars = cars || db.cars;

    carListEl.innerHTML = '';

    if (filteredCars.length === 0) {
        carListEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>검색 결과가 없습니다</p>
                ${currentSearchKeyword ? '<button onclick="clearSearch()" class="btn-reset-search">검색어 지우기</button>' : ''}
            </div>
        `;
        return;
    }

    // --- [V3.4] Staggered Animation & 3D Tilt Logic ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered delay based on index in current view
                const delay = (index % 5) * 100; // 0ms, 100ms, 200ms...
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    filteredCars.forEach((car, index) => {
        const carEl = document.createElement('div');
        carEl.className = 'car-card';
        // Initial State for Animation
        carEl.style.opacity = '0';
        carEl.style.transform = 'translateY(20px) scale(0.98)';
        carEl.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s ease'; // Spring Config

        // 🎯 SPA Click Event
        carEl.addEventListener('click', () => {
            goToAnalysis(car.id);
        });

        // 3D Tilt Effect on MouseMove
        carEl.addEventListener('mousemove', (e) => {
            const rect = carEl.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation
            const xRotation = ((y - rect.height / 2) / rect.height * 10).toFixed(2); // Max 10deg
            const yRotation = ((x - rect.width / 2) / rect.width * 10).toFixed(2);   // Max 10deg

            // Apply Transform
            carEl.style.transform = `perspective(1000px) rotateX(${-xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
        });

        // Reset Transform on MouseLeave
        carEl.addEventListener('mouseleave', () => {
            carEl.style.transform = 'translateY(0) scale(1)';
        });

        const brandName = db.brands.find(b => b.id === car.brand)?.name || car.brand.toUpperCase();

        // Highlight search terms
        const highlightedName = highlightSearchTerm(car.name, currentSearchKeyword);
        const highlightedGrade = highlightSearchTerm(car.grade, currentSearchKeyword);

        let imageContent;
        if (car.image) {
            imageContent = `<img src="${car.image}" alt="${car.name}" class="car-img">`;
        } else {
            imageContent = `<i class="fas fa-car" style="font-size: 2rem; color: #CBD5E1;"></i>`;
        }

        carEl.innerHTML = `
                <div class="car-image-container">${imageContent}</div>
                <div class="car-info-compact">
                    <div class="car-row-main">
                        <h3 class="car-name">${highlightedName}</h3>
                        <div class="price-group-compact">
                            <span class="price-value">${car.price.toLocaleString()}</span>
                            <span class="month-unit">원</span>
                        </div>
                    </div>
                    <div class="car-row-sub">
                        <span class="car-brand">${brandName}</span>
                        <span class="divider">|</span>
                        <div class="car-specs-compact">
                            <span>${highlightedGrade}</span>
                            <span>${car.mileage}</span>
                        </div>
                    </div>
                </div>
                <i class="fas fa-chevron-right car-chevron" style="color: #cbd5e1; font-size: 14px;"></i>
        `;
        carListEl.appendChild(carEl);
        observer.observe(carEl);
    });
}

function addEventListeners() {
    // Brand filter
    brandFilterEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.brand-item');
        if (!btn) return;
        document.querySelectorAll('.brand-item').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        currentBrand = btn.dataset.brand;

        // Keep search keyword when switching brands
        searchInCurrentBrand(currentSearchKeyword);
    });

    // Search input
    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchInCurrentBrand(e.target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.target.blur();
        });
    }
}

// --- LIVE COUNTDOWN BANNER ---
function initLiveCountdown() {
    const display = document.getElementById('liveCounter');
    if (!display) return;

    const minStock = 5;    // Stop at 5
    const digitHeight = 40; // Must match .digit-value height in CSS
    const STORAGE_KEY = 'live_stock_count';

    // 1. Get initial stock from storage or default
    let currentStock = parseInt(localStorage.getItem(STORAGE_KEY));
    if (!currentStock || isNaN(currentStock)) {
        currentStock = 73; // Default start
        localStorage.setItem(STORAGE_KEY, currentStock);
    }

    // 1. Prepare HTML structure for roulette effect
    display.innerHTML = ''; // Clear existing static digits
    for (let i = 0; i < 3; i++) {
        const box = document.createElement('div');
        box.className = 'digit-box';
        const viewport = document.createElement('div');
        viewport.className = 'digit-viewport';
        for (let j = 0; j <= 9; j++) {
            const value = document.createElement('div');
            value.className = 'digit-value';
            value.textContent = j;
            viewport.appendChild(value);
        }
        box.appendChild(viewport);
        display.appendChild(box);
    }

    const viewports = display.querySelectorAll('.digit-viewport');

    // 2. Function to update digits with animation
    function setStock(stock) {
        const stockStr = stock.toString().padStart(3, '0');
        for (let i = 0; i < 3; i++) {
            const digit = parseInt(stockStr[i]);
            const viewport = viewports[i];
            if (viewport) {
                viewport.style.transform = `translateY(-${digit * digitHeight}px)`;
            }
        }
    }

    // 3. Function to schedule the next decrease
    function scheduleNextUpdate() {
        if (currentStock <= minStock) {
            return; // Stop at 5
        }

        let nextDelay = 0;

        // Phase 1: 73 -> 69 (Fast)
        if (currentStock > 69) {
            nextDelay = Math.random() * 500 + 500;
        }
        // Phase 2: 69 -> 5 (Slow)
        else {
            nextDelay = Math.random() * (600000 - 240000) + 240000;
        }

        setTimeout(() => {
            if (currentStock > minStock) {
                currentStock--;
                localStorage.setItem(STORAGE_KEY, currentStock); // Persist update
                setStock(currentStock);
                scheduleNextUpdate();
            }
        }, nextDelay);
    }

    // 4. Initial setup and start
    setStock(currentStock);
    scheduleNextUpdate();
}


// --- DETAIL VIEW LOGIC (Merged) ---

// --- OPTION LOGIC ---
const OPTION_POOL = [
    { name: "썬루프", price: 5000, icon: "fa-sun" },
    { name: "헤드업 디스플레이", price: 4000, icon: "fa-desktop" },
    { name: "프리미엄 사운드", price: 8000, icon: "fa-music" },
    { name: "LED 패키지", price: 6000, icon: "fa-lightbulb" },
    { name: "스마트 커넥트", price: 3000, icon: "fa-wifi" },
    { name: "드라이빙 어시스턴트", price: 12000, icon: "fa-car-side" },
    { name: "컴포트 패키지", price: 7000, icon: "fa-couch" },
    { name: "통풍 시트", price: 4500, icon: "fa-wind" },
    { name: "어라운드 뷰", price: 9000, icon: "fa-camera" },
    { name: "빌트인 캠 2", price: 4000, icon: "fa-video" }
];

function getOrGenerateOptions(carId) {
    const car = db.cars.find(c => c.id == carId);
    if (!car) return [];

    // If options already exist, return them
    if (car.options && car.options.length > 0) {
        return car.options;
    }

    // Generate random options (4 to 8 options)
    const count = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
    const shuffled = [...OPTION_POOL].sort(() => 0.5 - Math.random());
    car.options = shuffled.slice(0, count);

    // Save to LocalStorage
    localStorage.setItem('carDB', JSON.stringify(db));
    return car.options;
}

function renderOptions(carId) {
    const options = getOrGenerateOptions(carId);
    const container = document.querySelector('#optionList .option-grid');
    if (!container) return;

    container.innerHTML = options.map(opt => `
        <button class="option-item" role="listitem" onclick="toggleOption(this)"
            aria-pressed="false" data-price="${opt.price}" data-icon="${opt.icon}">
            <div class="option-icon">
                <i class="fas ${opt.icon}"></i>
            </div>
            <span class="opt-name">${opt.name}</span>
            <span class="opt-price">+${opt.price.toLocaleString()}원</span>
            <div class="option-checkmark">
                <i class="fas fa-check"></i>
            </div>
        </button>
    `).join('');
}

function renderDetailView(car) {
    // 1. Basic Info
    window.selectedCar = car; // Fix: Persist selected car globally for quote/modal logic
    document.getElementById('brandBadge').textContent = db.brands.find(b => b.id === car.brand)?.name || car.brand;
    document.getElementById('vehicleName').textContent = car.name;
    document.getElementById('vehicleGrade').textContent = `${car.grade} • ${car.mileage}`;

    // Image
    const imgWrapper = document.getElementById('heroImage');
    if (car.image) {
        imgWrapper.innerHTML = `<img src="${car.image}" alt="${car.name}">`;
    } else {
        imgWrapper.innerHTML = `<i class="fas fa-car" style="font-size:5rem; color:#E5E5EA;"></i>`;
    }

    // 2. Section 1: Price Analysis
    renderPriceAnalysis(car.price, car.id);

    // 3. Section 2: Capital Comparison
    renderCapitalComparison(car.price, car.id);

    // 4. Options
    renderOptions(car.id);
    // Reset selected options UI silently
    if (typeof clearAllOptions === 'function') clearAllOptions(true); // force clean separate cars
    // If we're revisiting, maybe we want to keep selected options? 
    // For now reset to avoid conflicts between cars.

    // 5. Timer
    initTimer(car.id);

    // 6. Init Tabs
    initDocTabs();
    renderFAQ();
}

// --- Section 1: Price Analysis ---
function generatePriceHistory(currentPrice, carId) {
    // 1. Check LocalStorage
    const key = `price_history_${carId}`;
    const cached = localStorage.getItem(key);

    // Validate if cached data matches current price (if base price changed, invalidate)
    if (cached) {
        const parsed = JSON.parse(cached);
        // Ensure the last price in history matches expected current price (simplest validation)
        if (parsed[4] === currentPrice) {
            return parsed;
        }
    }

    // 2. Generate New Data
    // Constraint: Past prices > Current (Current is lowest) using random diff (5,000~20,000원)
    const prices = [];
    for (let i = 0; i < 4; i++) {
        const diff = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
        prices.push(currentPrice + diff);
    }
    prices.push(currentPrice);

    // 3. Save to LocalStorage
    localStorage.setItem(key, JSON.stringify(prices));

    return prices;
}

function renderPriceAnalysis(currentPrice, carId) {
    const history = generatePriceHistory(currentPrice, carId);
    // 가격을 라벨로 사용 (5개월 전 ~ 현재)
    const labels = history.map(price => price.toLocaleString() + '원');

    const minPrice = Math.min(...history);
    const firstPrice = history[0];
    const nowPrice = history[4];

    // 변동률 계산 및 뱃지 업데이트
    const changeRate = ((nowPrice - firstPrice) / firstPrice * 100).toFixed(1);
    const changeBadge = document.getElementById('changeBadge');
    const changeRateText = document.getElementById('changeRateText');

    if (changeBadge && changeRateText) {
        // 변동률에 따라 클래스 및 아이콘 변경
        changeBadge.classList.remove('positive', 'negative', 'neutral');

        if (changeRate > 0) {
            changeBadge.classList.add('positive');
            changeRateText.innerHTML = `<i class="fas fa-arrow-up"></i> ${changeRate}%`;
        } else if (changeRate < 0) {
            changeBadge.classList.add('negative');
            changeRateText.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(changeRate)}%`;
        } else {
            changeBadge.classList.add('neutral');
            changeRateText.innerHTML = `0.0%`;
        }
    }

    // Render Chart
    const ctx = document.getElementById('priceChart').getContext('2d');
    // Destroy previous chart if exists
    if (window.myPriceChart) window.myPriceChart.destroy();

    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(220, 38, 38, 0.5)'); // Primary Red
    gradient.addColorStop(1, 'rgba(220, 38, 38, 0.0)');

    window.myPriceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '렌탈료',
                data: history,
                borderColor: '#DC2626',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4, // Smooth bezier
                fill: true,
                // 1~4개월은 옅게, 현재는 진하게
                pointBackgroundColor: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)', '#fff'],
                pointBorderColor: ['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.4)', '#DC2626'],
                pointBorderWidth: [2, 2, 2, 2, 3],
                pointRadius: [5, 5, 5, 5, 7],
                pointHoverRadius: 12,
                pointHoverBackgroundColor: '#DC2626',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 0
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(220, 38, 38, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 15, weight: 'bold' },
                    padding: 14,
                    cornerRadius: 12,
                    displayColors: false,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 2,
                    callbacks: {
                        title: function (context) {
                            return '💰 월간 렌탈료';
                        },
                        label: function (context) {
                            return context.parsed.y.toLocaleString() + '원';
                        },
                        afterLabel: function (context) {
                            const currentPrice = history[history.length - 1];
                            const diff = context.parsed.y - currentPrice;
                            if (diff > 0) {
                                return '현재보다 +' + diff.toLocaleString() + '원';
                            }
                            return '최저가!';
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: false,
                    min: Math.min(...history) - 50000
                },
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        font: function (context) {
                            const index = context.index;
                            // 마지막 레이블(현재 렌탈료)만 크고 진하게
                            if (index === labels.length - 1) {
                                return {
                                    size: 10,
                                    weight: 'bold',
                                    family: 'Pretendard'
                                };
                            }
                            return {
                                size: 9,
                                weight: '600',
                                family: 'Pretendard'
                            };
                        },
                        color: function (context) {
                            const index = context.index;
                            // 마지막 레이블만 레드 강조
                            return index === labels.length - 1 ? '#DC2626' : '#8B95A1';
                        },
                        padding: 8
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default') {
                        delay = context.dataIndex * 200; // 각 포인트마다 200ms 지연
                    }
                    return delay;
                }
            }
        }
    });
}

// --- Section 2: Capital Comparison ---
function generateCapitalComparison(base, carId) {
    // 1. Check LocalStorage
    const key = `capital_data_${carId}`;
    const cached = localStorage.getItem(key);
    if (cached) {
        return JSON.parse(cached);
    }

    // 2. Generate New Data if no cache
    const capitals = [];
    // A Capital = Base (Cheapest)
    capitals.push({
        name: 'A캐피탈', code: 'A', price: base,
        features: ['빠른승인', '최저금리'], rating: 4.9
    });

    ['B', 'C', 'D'].forEach(code => {
        const randomBase = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
        const randomTens = Math.floor(Math.random() * 101) * 10;
        capitals.push({
            name: `${code}캐피탈`, code: code,
            price: base + randomBase + randomTens,
            features: ['서류간소화'], rating: (4.0 + Math.random()).toFixed(1)
        });
    });

    // 3. Save to LocalStorage
    localStorage.setItem(key, JSON.stringify(capitals));

    return capitals;
}

function renderCapitalComparison(basePrice, carId) {
    // 1. 데이터 생성 (A, B, C, D 순서) - Pass carId for caching
    const data = generateCapitalComparison(basePrice, carId);

    // 2. 최저가(1위) 표시
    const bestPrice = data[0].price;
    const bestPriceDisplay = document.getElementById('bestPriceDisplay');
    if (bestPriceDisplay) {
        bestPriceDisplay.textContent = bestPrice.toLocaleString() + '원';
    }

    // 3. 절감액 계산 (2위 가격 - 1위 가격)
    const savings = data.length > 1 ? data[1].price - data[0].price : 0;

    // 4. HTML 생성
    const container = document.getElementById('capitalList');
    if (!container) return;

    container.innerHTML = data.map((cap, idx) => {
        if (idx === 0) {
            // 1위: Best Choice 파란 카드
            return `
                <div class="capital-card best-blue">
                    <div class="best-badge">Best Choice</div>
                    <div class="top-row">
                        <div class="company-name">${cap.name}</div>
                        <div class="company-price">${cap.price.toLocaleString()}원</div>
                    </div>
                    <div class="savings-box">
                        ${data.length > 1 ? `${data[1].name} 대비 월 ${savings.toLocaleString()}원 절감!` : '최저가 업체'}
                    </div>
                </div>
            `;
        } else {
            // 2위 이하: Normal 흰 카드
            return `
                <div class="capital-card normal">
                    <div class="company-name">${cap.name}</div>
                    <div class="company-price">${cap.price.toLocaleString()}원</div>
                </div>
            `;
        }
    }).join('');
} // End renderCapitalComparison

// --- [V3.4] Global Floating Button Scroll Logic ---
function initFloatingButtonLogic() {
    const floatBtn = document.getElementById('floatingQuoteBtn');

    window.addEventListener('scroll', () => {
        // 1. Only run if we are on Analysis View
        const analysisView = document.getElementById('view-analysis');
        if (analysisView.classList.contains('hidden')) {
            if (floatBtn) floatBtn.classList.remove('visible');
            return;
        }

        // 2. Check for Target (B Capital)
        const capitalList = document.getElementById('capitalList');
        if (!capitalList || capitalList.children.length < 2) return;

        const targetEl = capitalList.children[1]; // B Capital Card
        if (!floatBtn || !targetEl) return;

        // 3. Check Position
        const rect = targetEl.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Show if target is somewhat near the viewport visibility (e.g. scrolled down to it)
        // User said: "When scrolled down to B Capital"
        // Show if target is somewhat near the viewport visibility (e.g. scrolled down to it)
        // User said: "When scrolled down to B Capital"
        // If rect.top <= viewHeight (it's entering from bottom)
        if (rect.top <= viewHeight - 50) {
            floatBtn.classList.remove('hidden'); // Fix: Remove hidden (display:none)
            floatBtn.classList.add('visible');
        } else {
            floatBtn.classList.remove('visible');
            // optional logic
        }
    });

    // Attach Click Event to Open Modal
    floatBtn.addEventListener('click', openQuoteConfirmModal);
}

// --- Quote Confirmation Modal Logic ---
function openQuoteConfirmModal() {
    const modal = document.getElementById('quoteConfirmModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Small delay to allow display:flex to apply before opacity transition
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeQuoteConfirmModal() {
    const modal = document.getElementById('quoteConfirmModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300); // match transition
    }
}

// Handle Modal Actions
document.addEventListener('DOMContentLoaded', () => {
    // Other init logic...

    // Quote Confirmation Modal Buttons
    const btnYes = document.getElementById('btnConfirmQuote');
    const btnNo = document.getElementById('btnCancelQuote');

    if (btnYes) {
        btnYes.addEventListener('click', handleQuoteConfirmation);
    }
    if (btnNo) {
        btnNo.addEventListener('click', closeQuoteConfirmModal);
    }

    // Requote Confirmation Modal Buttons
    const btnConfirmRequote = document.getElementById('btnConfirmRequote');
    const btnCancelRequote = document.getElementById('btnCancelRequote');

    if (btnConfirmRequote) {
        btnConfirmRequote.addEventListener('click', confirmRequote);
    }
    if (btnCancelRequote) {
        btnCancelRequote.addEventListener('click', closeRequoteConfirmModal);
    }
});

function handleQuoteConfirmation() {
    // 1. Data Collection (Mimic requestQuote structure)
    // We assume window.selectedCar is set when Detail View is rendered
    if (!window.selectedCar) {
        alert('차량 정보를 찾을 수 없습니다.');
        closeQuoteConfirmModal();
        return;
    }

    // Capital Analysis Price (Use best price found or base)
    // For now, let's use the first capital's monthly rent from the logic, or window.selectedCar.price
    // Since we are in "Analysis" view, we can try to grab the best price displayed?
    // Let's stick to base logic for safety + minimal data as requested (User said "Just image" but we need object)

    // Collect selected options from the page
    const selectedOptions = [];
    const selectedOptionElements = document.querySelectorAll('.option-item.selected');
    selectedOptionElements.forEach(opt => {
        const optionName = opt.querySelector('.opt-name')?.textContent || '';
        const optionPrice = parseInt(opt.dataset.price || 0);
        const optionIcon = opt.dataset.icon || 'fa-check';

        if (optionName) {
            selectedOptions.push({
                name: optionName,
                price: optionPrice,
                icon: optionIcon
            });
        }
    });

    console.log('[handleQuoteConfirmation] Selected options:', selectedOptions);

    // Calculate total price (base + options)
    const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const totalPrice = window.selectedCar.price + optionsTotal;

    // Attempt to match requestQuote structure so it renders correctly
    const quoteData = {
        id: 'quote_' + Date.now(),
        timestamp: Date.now(),
        car: {
            id: window.selectedCar.id,
            brand: window.selectedCar.brand,
            name: window.selectedCar.name,
            grade: window.selectedCar.grade,
            mileage: window.selectedCar.mileage,
            image: window.selectedCar.image,
            basePrice: window.selectedCar.price
        },
        options: selectedOptions,
        totalPrice: totalPrice,
        customerPhone: "010-0000-0000",
        selectedOptions: {
            term: '60개월',
            mileage: '10,000km',
            deposit: '30%',
            region: '서울/경기'
        }
    };

    // Grab Login Info if exists
    const loginData = localStorage.getItem('customerLogin');
    if (loginData) {
        const parsed = JSON.parse(loginData);
        quoteData.customerPhone = parsed.phone;
    }

    // 2. Save to localStorage
    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    quotes.push(quoteData);
    localStorage.setItem('savedQuotes', JSON.stringify(quotes));

    // 2-1. Save to adminQuotes (어드민 페이지에서 보기 위함)
    const adminQuotes = JSON.parse(localStorage.getItem('adminQuotes') || '[]');
    adminQuotes.push(quoteData);
    localStorage.setItem('adminQuotes', JSON.stringify(adminQuotes));

    console.log('[handleQuoteConfirmation] Quote saved:', quoteData);

    // 3. UX Feedback & Redirect
    closeQuoteConfirmModal();

    setTimeout(() => {
        // Redirect to Saved Quotes TAB first
        switchTab('nav-quotes');

        // Then immediately open the Detail View for this new quote
        // We pass the ID of the quote we just created
        openQuoteDetail(quoteData.id);
    }, 300);
}

// --- Toggle Price Display (for testing AI loading / Final price) ---
function togglePriceDisplay(showAILoading) {
    console.log('[togglePriceDisplay] showAILoading:', showAILoading);

    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const quote = quotes.find(q => q.id === currentViewingQuoteId);

    if (!quote) {
        console.error('[togglePriceDisplay] Quote not found:', currentViewingQuoteId);
        return;
    }

    const priceContainer = document.getElementById('detailTotalPrice')?.parentElement;
    if (!priceContainer) {
        console.error('[togglePriceDisplay] priceContainer not found');
        return;
    }

    if (showAILoading) {
        // Show AI Loading State
        const estimatedPrice = quote.totalPrice || quote.car.basePrice || 0;
        priceContainer.innerHTML = `
            <div class="ai-loading-overlay">
                <div class="ai-bg-text">${estimatedPrice.toLocaleString()}원</div>
                <div class="ai-3d-icon">
                    <div class="ai-cube">
                        <div class="cube-face front"><i class="fas fa-brain"></i></div>
                        <div class="cube-face back"></div>
                        <div class="cube-face right"></div>
                        <div class="cube-face left"></div>
                        <div class="cube-face top"></div>
                        <div class="cube-face bottom"></div>
                    </div>
                </div>
                <p class="ai-compact-message">
                    <strong>AI 견적 분석 중...</strong><br>
                    <span class="ai-sub-text">최적의 견적을 산출하고 있어요</span>
                </p>
                <div class="ai-mini-progress">
                    <div class="ai-mini-fill"></div>
                </div>
            </div>
        `;
        priceContainer.classList.add('ai-loading-state');
    } else {
        // Show Final Price
        const displayPrice = quote.adminFinalPrice || (quote.totalPrice || quote.car.basePrice);
        const isTestPrice = !quote.adminFinalPrice;

        priceContainer.innerHTML = `
            <span class="label">최종 월 렌탈료</span>
            <h1 class="price" id="detailTotalPrice">${displayPrice.toLocaleString()}원</h1>
            ${isTestPrice ? '<p style="font-size: 0.85rem; color: #EF4444; margin-top: 0.5rem;">⚠️ 테스트 가격 (어드민 미입력)</p>' : ''}
        `;
        priceContainer.classList.remove('ai-loading-state');
    }

    console.log('[togglePriceDisplay] Update complete');
}

// --- Quote Detail View Logic ---
function openQuoteDetail(quoteId) {
    console.log('[openQuoteDetail] START - quoteId:', quoteId, 'testAILoadingMode:', window.testAILoadingMode);

    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const quote = quotes.find(q => q.id === quoteId);

    if (!quote) {
        console.error('Quote not found:', quoteId);
        return;
    }

    // 현재 로그인한 사용자 확인
    const loginData = localStorage.getItem('customerLogin');
    let currentUserPhone = null;

    if (loginData) {
        const parsed = JSON.parse(loginData);
        currentUserPhone = parsed.phone;
    }

    // 본인의 견적인지 확인
    if (quote.customerPhone !== currentUserPhone) {
        alert('본인의 견적만 조회할 수 있습니다.');
        return;
    }

    // Store current viewing quote ID
    currentViewingQuoteId = quoteId;

    // 1. Hide List
    const listContainer = document.getElementById('savedQuotesList');
    const listHeader = document.querySelector('#view-quotes .section-header');
    if (listContainer) listContainer.classList.add('hidden');
    if (listHeader) listHeader.classList.add('hidden');

    // 2. Show Detail View
    const detailView = document.getElementById('quoteDetailView');
    if (detailView) {
        detailView.classList.remove('hidden');

        // 3. Render Content
        // Image
        const heroContainer = document.getElementById('detailHeroImage');
        if (heroContainer) {
            heroContainer.innerHTML = `<img src="${quote.car.image}" alt="${quote.car.name}">`;
        }

        // Info
        const carName = document.getElementById('detailCarName');
        if (carName) carName.textContent = quote.car.name;

        // --- Render Accordions ---
        const accordionContainer = document.getElementById('detailAccordionContainer');
        if (accordionContainer) {
            // Get saved values from quote
            const savedTerm = quote.selectedOptions?.term || '60개월';
            const savedMileage = quote.selectedOptions?.mileage || '10,000km';
            const savedDeposit = quote.selectedOptions?.deposit || '30%';
            const savedRegion = quote.selectedOptions?.region || '서울/경기';

            // Get car options
            const carOptions = getOrGenerateOptions(quote.car.id);
            const savedOptionNames = (quote.options || []).map(o => o.name);
            const selectedCount = savedOptionNames.length;

            // Accordion data including options
            const selectorData = [
                {
                    id: 'term',
                    title: '이용 기간',
                    currentValue: savedTerm,
                    options: ['36개월', '48개월', '60개월']
                },
                {
                    id: 'mileage',
                    title: '연간 주행거리',
                    currentValue: savedMileage,
                    options: ['10,000km', '20,000km', '30,000km', '40,000km', '50,000km', '무제한']
                },
                {
                    id: 'deposit',
                    title: '보증금',
                    currentValue: savedDeposit,
                    options: ['0%', '10%', '20%', '30%', '40%', '50%']
                },
                {
                    id: 'region',
                    title: '인도 지역',
                    currentValue: savedRegion,
                    options: ['서울/경기', '충청/강원', '전라/경상', '제주/도서산간']
                },
                {
                    id: 'options',
                    title: '추가 옵션 선택',
                    currentValue: `${selectedCount}개 선택됨`,
                    isOptionGrid: true
                }
            ];

            accordionContainer.innerHTML = selectorData.map((item, index) => {
                const isOpen = index === 0 ? 'active' : '';

                let contentHtml = '';

                if (item.isOptionGrid) {
                    // Render actual option-item buttons (accordion style)
                    contentHtml = `
                        <div class="accordion-options-grid" style="grid-template-columns: repeat(2, 1fr);">
                            ${carOptions.map(opt => {
                                const isSelected = savedOptionNames.includes(opt.name);
                                return `
                                    <button class="option-item ${isSelected ? 'selected' : ''}"
                                        role="listitem"
                                        onclick="toggleOption(this)"
                                        aria-pressed="${isSelected}"
                                        data-price="${opt.price}"
                                        data-icon="${opt.icon}">
                                        <span class="opt-name">${opt.name}</span>
                                        <span class="opt-price" style="font-size: 0.8rem; color: #94a3b8; margin-left: 4px;">+${opt.price.toLocaleString()}원</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    `;
                } else {
                    // Regular accordion options
                    contentHtml = `
                        <div class="accordion-options-grid ${item.id === 'region' ? 'full-width' : ''}">
                            ${item.options.map(opt => {
                                const isSelected = item.currentValue === opt ? 'selected' : '';
                                return `<button class="accordion-option-btn ${isSelected}" onclick="selectAccordionOption(this, '${item.id}')">${opt}</button>`;
                            }).join('')}
                        </div>
                    `;
                }

                return `
                <div class="accordion-item ${isOpen}" id="accordion-${item.id}">
                    <button class="accordion-header" onclick="toggleAccordion('accordion-${item.id}')">
                        <span>${item.title}</span>
                        <span class="header-value" id="value-${item.id}">${item.currentValue}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="accordion-content">
                        ${contentHtml}
                    </div>
                </div>
                `;
            }).join('');

            // 재견적 요청하기 버튼 추가 (기존 버튼 제거 후 추가)
            const existingRequoteBtn = document.querySelector('.requote-btn-container');
            if (existingRequoteBtn) {
                existingRequoteBtn.remove();
            }

            accordionContainer.insertAdjacentHTML('afterend', `
                <div class="requote-btn-container" style="margin-top: 1.5rem; text-align: center;">
                    <button class="btn-requote" onclick="requestRequote()">
                        <i class="fas fa-sync-alt"></i>
                        재견적 요청하기
                    </button>
                </div>
            `);
        }

        // Price - Conditional Rendering based on Admin Final Price
        const priceContainer = document.getElementById('detailTotalPrice')?.parentElement;
        console.log('[PRICE] priceContainer found:', !!priceContainer);

        if (priceContainer) {
            // Determine what to show
            let showAILoading;

            console.log('[DEBUG] quote.adminFinalPrice:', quote.adminFinalPrice);
            console.log('[DEBUG] window.testAILoadingMode:', window.testAILoadingMode);

            if (quote.adminFinalPrice) {
                // If admin has entered final price, always show it
                showAILoading = false;
                console.log('[DEBUG] Branch: Admin has final price, showing final price');
            } else if (window.testAILoadingMode === true) {
                // Explicitly requested AI loading
                showAILoading = true;
                console.log('[DEBUG] Branch: Explicitly showing AI loading');
            } else if (window.testAILoadingMode === false) {
                // Explicitly requested final price (test mode)
                showAILoading = false;
                console.log('[DEBUG] Branch: Explicitly showing test final price');
            } else {
                // Default: show AI loading when no final price
                showAILoading = true;
                console.log('[DEBUG] Branch: Default AI loading');
            }

            console.log('[DEBUG] Final decision - showAILoading:', showAILoading);

            if (!showAILoading) {
                // Show actual final price (or test price)
                const displayPrice = quote.adminFinalPrice || (quote.totalPrice || quote.car.basePrice);
                const isTestPrice = !quote.adminFinalPrice;

                priceContainer.innerHTML = `
                    <span class="label">최종 월 렌탈료</span>
                    <h1 class="price" id="detailTotalPrice">${displayPrice.toLocaleString()}원</h1>
                    ${isTestPrice ? '<p style="font-size: 0.85rem; color: #EF4444; margin-top: 0.5rem;">⚠️ 테스트 가격 (어드민 미입력)</p>' : ''}
                `;
                priceContainer.classList.remove('ai-loading-state');
            } else {
                // Show AI Loading State with 3D Graphics
                const estimatedPrice = quote.totalPrice || quote.car.basePrice || 0;
                priceContainer.innerHTML = `
                    <div class="ai-loading-overlay">
                        <!-- Background Blur Text with Price -->
                        <div class="ai-bg-text">${estimatedPrice.toLocaleString()}원</div>
                        
                        <!-- 3D AI Icon -->
                        <div class="ai-3d-icon">
                            <div class="ai-cube">
                                <div class="cube-face front"><i class="fas fa-brain"></i></div>
                                <div class="cube-face back"></div>
                                <div class="cube-face right"></div>
                                <div class="cube-face left"></div>
                                <div class="cube-face top"></div>
                                <div class="cube-face bottom"></div>
                            </div>
                        </div>
                        
                        <!-- Compact Message -->
                        <p class="ai-compact-message">
                            <strong>AI 견적 분석 중...</strong><br>
                            <span class="ai-sub-text">최적의 견적을 산출하고 있어요</span>
                        </p>
                        
                        <!-- Mini Progress -->
                        <div class="ai-mini-progress">
                            <div class="ai-mini-fill"></div>
                        </div>
                    </div>
                `;
                priceContainer.classList.add('ai-loading-state');
            }
        }

        // Render FAQ and Documents sections
        console.log('[openQuoteDetail] About to render FAQ and Documents');
        renderFAQ();
        renderDocs('personal');
        console.log('[openQuoteDetail] Rendering complete');
    }
}

// --- Accordion Logic ---
function toggleAccordion(id) {
    // Close others
    const allAccordions = document.querySelectorAll('.accordion-item');
    allAccordions.forEach(acc => {
        if (acc.id !== id) acc.classList.remove('active');
    });

    // Toggle current
    const target = document.getElementById(id);
    if (target) {
        target.classList.toggle('active');
    }
}

function selectAccordionOption(btn, type) {
    // 1. Visual Update
    const container = btn.closest('.accordion-options-grid');
    container.querySelectorAll('.accordion-option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // 2. Update Header Value
    const headerValue = document.getElementById(`value-${type}`);
    if (headerValue) headerValue.textContent = btn.innerText;

    // 3. Mock Price Update (Optional: Make it feel alive)
    // In a real app, this would recalculate based on logic.
    // For now, simple visual feedback is enough.
}

function toggleOptionSelection(btn, type) {
    btn.classList.toggle('selected');

    // Update count for multi-select
    const container = btn.closest('.accordion-options-grid');
    const count = container.querySelectorAll('.accordion-option-btn.selected').length;

    const headerValue = document.getElementById(`value-${type}`);
    if (headerValue) headerValue.textContent = `${count}개 선택됨`;
}

// Toggle option in detail view
function toggleOption(btn) {
    const isSelected = btn.classList.contains('selected');

    if (isSelected) {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
    } else {
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
    }

    // Update accordion header count
    const optionGrid = btn.closest('.accordion-options-grid');
    if (optionGrid) {
        const selectedCount = optionGrid.querySelectorAll('.option-item.selected').length;
        const headerValue = document.getElementById('value-options');
        if (headerValue) {
            headerValue.textContent = `${selectedCount}개 선택됨`;
        }
    }
}

function closeQuoteDetail() {
    // 1. Hide Detail View
    const detailView = document.getElementById('quoteDetailView');
    if (detailView) detailView.classList.add('hidden');

    // 2. Show List
    const listContainer = document.getElementById('savedQuotesList');
    const listHeader = document.querySelector('#view-quotes .section-header');
    if (listContainer) listContainer.classList.remove('hidden');
    if (listHeader) listHeader.classList.remove('hidden');

    // Refresh list in case of changes
    renderSavedQuotes();
}

// Request re-quote (Opens confirmation modal)
window.requestRequote = function () {
    if (!currentViewingQuoteId) {
        if (window.Toast) {
            Toast.error('견적 정보를 불러올 수 없습니다.');
        }
        return;
    }

    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const quote = quotes.find(q => q.id === currentViewingQuoteId);

    if (!quote) {
        if (window.Toast) {
            Toast.error('견적 정보를 찾을 수 없습니다.');
        }
        return;
    }

    // Open confirmation modal
    openRequoteConfirmModal();
};

// Open requote confirmation modal
function openRequoteConfirmModal() {
    const modal = document.getElementById('requoteConfirmModal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// Close requote confirmation modal
function closeRequoteConfirmModal() {
    const modal = document.getElementById('requoteConfirmModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

// Confirm requote (actual processing)
function confirmRequote() {
    if (!currentViewingQuoteId) {
        closeRequoteConfirmModal();
        return;
    }

    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const quote = quotes.find(q => q.id === currentViewingQuoteId);

    if (!quote) {
        closeRequoteConfirmModal();
        return;
    }

    // 현재 상세 페이지에서 선택된 옵션들 수집
    const selectedOptionsList = [];
    const selectedOptionElements = document.querySelectorAll('.option-item.selected');
    selectedOptionElements.forEach(opt => {
        const optionName = opt.querySelector('.opt-name')?.textContent || '';
        const optionPrice = parseInt(opt.dataset.price || 0);
        const optionIcon = opt.dataset.icon || 'fa-check';

        if (optionName) {
            selectedOptionsList.push({
                name: optionName,
                price: optionPrice,
                icon: optionIcon
            });
        }
    });

    // 조건 정보 수집
    const selectedConditions = {
        term: document.getElementById('value-term')?.textContent || '60개월',
        mileage: document.getElementById('value-mileage')?.textContent || '10,000km',
        deposit: document.getElementById('value-deposit')?.textContent || '30%',
        region: document.getElementById('value-region')?.textContent || '서울/경기'
    };

    // 총 가격 재계산
    const optionsTotal = selectedOptionsList.reduce((sum, opt) => sum + opt.price, 0);
    const totalPrice = quote.car.basePrice + optionsTotal;

    console.log('[confirmRequote] Selected options list:', selectedOptionsList);
    console.log('[confirmRequote] Selected conditions:', selectedConditions);
    console.log('[confirmRequote] Original quote:', quote);

    // 1. savedQuotes 업데이트 (기존 견적 업데이트 - 1개 유지)
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const existingIndex = savedQuotes.findIndex(q => q.id === currentViewingQuoteId);

    const updatedQuoteData = {
        id: currentViewingQuoteId,  // 기존 ID 유지
        timestamp: quote.timestamp,  // 원본 생성 시간 유지
        car: quote.car,
        options: selectedOptionsList.length > 0 ? selectedOptionsList : (quote.options || []),
        totalPrice: totalPrice,
        customerPhone: quote.customerPhone,
        selectedOptions: selectedConditions,
        lastUpdated: Date.now()  // 마지막 업데이트 시간
    };

    if (existingIndex !== -1) {
        savedQuotes[existingIndex] = updatedQuoteData;  // 기존 견적 업데이트
        console.log('[confirmRequote] Updated existing quote in savedQuotes');
    } else {
        savedQuotes.push(updatedQuoteData);  // 혹시 없으면 추가
        console.log('[confirmRequote] Added new quote to savedQuotes');
    }
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));

    // 2. adminQuotes에 새로운 재견적 이력 추가 (이력 관리용)
    const adminQuotes = JSON.parse(localStorage.getItem('adminQuotes') || '[]');
    const adminQuoteData = {
        id: 'requote_' + Date.now(),  // 새로운 ID (이력 추적용)
        timestamp: Date.now(),
        car: quote.car,
        options: selectedOptionsList.length > 0 ? selectedOptionsList : (quote.options || []),
        totalPrice: totalPrice,
        customerPhone: quote.customerPhone,
        isRequote: true,  // 재견적 플래그
        originalQuoteId: currentViewingQuoteId,  // 원본 견적 ID
        selectedOptions: selectedConditions,
        requoteReason: '고객 옵션/조건 변경'
    };
    adminQuotes.push(adminQuoteData);
    localStorage.setItem('adminQuotes', JSON.stringify(adminQuotes));

    // 3. requoteRequests에 저장 (히스토리용)
    const requoteRequests = JSON.parse(localStorage.getItem('requoteRequests') || '[]');
    requoteRequests.push({
        id: adminQuoteData.id,
        quoteId: currentViewingQuoteId,
        carName: quote.car.name,
        originalPrice: quote.totalPrice,
        newPrice: totalPrice,
        selectedOptions: selectedConditions,
        timestamp: Date.now(),
        status: 'pending'
    });
    localStorage.setItem('requoteRequests', JSON.stringify(requoteRequests));

    console.log('[confirmRequote] Updated quote saved to savedQuotes:', updatedQuoteData);
    console.log('[confirmRequote] New requote history added to adminQuotes:', adminQuoteData);

    // Close modal and show success message
    closeRequoteConfirmModal();

    setTimeout(() => {
        if (window.Toast) {
            Toast.success('재견적 요청이 저장되었습니다!');
        } else {
            alert('재견적 요청이 저장되었습니다!');
        }

        // 견적 보관함 새로고침
        renderSavedQuotes();
    }, 300);
}

// Submit quote to admin
window.submitQuoteToAdmin = function () {
    // Check if we have a quote being viewed
    if (!currentViewingQuoteId) {
        alert('견적 정보를 불러올 수 없습니다.');
        return;
    }

    // Get currently viewing quote
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const currentQuote = savedQuotes.find(q => q.id === currentViewingQuoteId);

    if (!currentQuote) {
        alert('견적 정보를 찾을 수 없습니다.');
        return;
    }

    // Check if already submitted
    const adminQuotes = JSON.parse(localStorage.getItem('adminQuotes') || '[]');
    const alreadySubmitted = adminQuotes.find(q => q.id === currentQuote.id);

    if (alreadySubmitted) {
        alert('이미 상담 신청이 완료된 견적입니다.');
        return;
    }

    // Add to admin quotes
    adminQuotes.push({
        ...currentQuote,
        submittedAt: new Date().getTime()
    });
    localStorage.setItem('adminQuotes', JSON.stringify(adminQuotes));

    // Success feedback
    alert('✅ 상담 신청이 완료되었습니다!\n\n전문 상담원이 최적의 견적을 산출하여 곧 연락드리겠습니다.');

    // Optional: Close detail view and return to list
    closeQuoteDetail();
};

// --- Timer ---
function initTimer(carId) {
    if (timerInterval) clearInterval(timerInterval);

    const key = `timer_${carId || 'default'}`;
    let start = localStorage.getItem(key);
    if (!start) {
        start = new Date().getTime();
        localStorage.setItem(key, start);
    }

    const duration = 7 * 24 * 60 * 60 * 1000;
    const end = parseInt(start) + duration;

    timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const left = end - now;

        const el = document.getElementById('expiryTimer');
        const bar = document.getElementById('timerProgress');
        if (!el) return;

        if (left < 0) {
            el.textContent = "만료됨";
            return;
        }

        const days = Math.floor(left / (1000 * 60 * 60 * 24));
        const hours = Math.floor((left % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((left % (1000 * 60)) / 1000);

        el.textContent = `${days}일 ${hours}:${mins}:${secs}`;
        if (bar) bar.style.width = `${(left / duration) * 100}%`;
    }, 1000);
}

// --- Tabs & FAQ ---
function initDocTabs() {
    renderDocs('personal');
}
window.switchDocTab = function (type, event) {
    // Find the closest doc-tabs container to properly scope the active state
    const clickedTab = event?.target || window.event?.target;
    if (clickedTab) {
        const tabsContainer = clickedTab.closest('.doc-tabs');
        if (tabsContainer) {
            // Only update tabs within the same container
            tabsContainer.querySelectorAll('.doc-tab').forEach(b => b.classList.remove('active'));
            clickedTab.classList.add('active');
        }
    }

    // Render docs to all containers
    renderDocs(type);
};

// --- Saved Quotes Render Logic ---
function renderSavedQuotes() {
    const allQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const container = document.getElementById('savedQuotesList');

    if (!container) return;

    // 현재 로그인한 사용자의 전화번호 가져오기
    const loginData = localStorage.getItem('customerLogin');
    let currentUserPhone = null;

    if (loginData) {
        const parsed = JSON.parse(loginData);
        currentUserPhone = parsed.phone;
    }

    // 로그인하지 않은 경우
    if (!currentUserPhone) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sign-in-alt"></i>
                <p>견적 보관함을 이용하려면 로그인이 필요합니다.</p>
            </div>`;
        return;
    }

    // 현재 로그인한 사용자의 견적만 필터링
    const quotes = allQuotes.filter(q => q.customerPhone === currentUserPhone);

    if (quotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>보관된 견적이 없습니다.</p>
                <button class="btn-primary" onclick="switchTab('nav-home')">
                    차량 구경하러 가기
                </button>
            </div>`;
        return;
    }

    // Sort by newest first
    const sortedQuotes = quotes.sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = sortedQuotes.map(quote => `
        <div class="quote-card" onclick="openQuoteDetail('${quote.id}')" style="cursor: pointer;">
            <div class="quote-header">
                <span class="quote-date">${new Date(quote.timestamp).toLocaleDateString()}</span>
                <button class="btn-delete-quote" onclick="event.stopPropagation(); deleteQuote('${quote.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="quote-body">
                <div class="quote-img">
                    <img src="${quote.car.image}" alt="${quote.car.name}">
                </div>
                <div class="quote-info">
                    <h3 class="quote-car-name">${quote.car.name}</h3>
                    <p class="quote-car-detail">${quote.car.grade}</p>
                    <div class="quote-price">
                        ${(quote.totalPrice || 0).toLocaleString()}원 <span class="unit">/ 월</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteQuote(id) {
    if (!confirm('이 견적을 삭제하시겠습니까?')) return;

    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    const newQuotes = quotes.filter(q => q.id !== id);
    localStorage.setItem('savedQuotes', JSON.stringify(newQuotes));
    renderSavedQuotes(); // Re-render
}
function renderDocs(type) {
    const data = {
        personal: ['신분증 사본', '재직증명서', '급여통장 사본'],
        business: ['사업자등록증', '부가세과세표준증명', '사업용 계좌'],
        corporate: ['법인등기부등본', '재무제표', '법인인감']
    };

    const html = data[type].map(item =>
        `<div style="padding:10px; background:#F9FAFB; margin-bottom:4px; border-radius:6px;">✅ ${item}</div>`
    ).join('');

    // 모든 doc-content 컨테이너에 렌더링 (여러 페이지에 있을 수 있음)
    const containers = document.querySelectorAll('#doc-content, .doc-content');
    console.log(`[renderDocs] Found ${containers.length} document containers for type: ${type}`);
    containers.forEach((el, index) => {
        console.log(`[renderDocs] Rendering to container ${index + 1}:`, el);
        el.innerHTML = html;
    });
}
function renderFAQ() {
    const faqs = [
        {
            question: '초기비용 0원 가능한가요?',
            answer: '네, 심사 결과에 따라 보증금 없이 진행 가능합니다.',
            icon: '💰'
        },
        {
            question: '보험은 어떻게 되나요?',
            answer: '만 26세 이상 누구나 운전 가능한 보험이 포함되어 있습니다.',
            icon: '🚗'
        },
        {
            question: '중도 해지 시 위약금이 있나요?',
            answer: '계약 조건에 따라 다르며, 상담 시 자세히 안내드립니다.',
            icon: '📋'
        },
        {
            question: '신용 점수가 낮아도 가능한가요?',
            answer: '네, 여러 캐피탈사를 비교하여 최적의 조건을 찾아드립니다.',
            icon: '✅'
        }
    ];

    const html = faqs.map((faq, index) => `
        <div class="faq-card" data-index="${index}">
            <div class="faq-question">
                <span class="faq-icon">${faq.icon}</span>
                <span class="faq-q-text">Q. ${faq.question}</span>
                <i class="fas fa-chevron-down faq-arrow"></i>
            </div>
            <div class="faq-answer">
                <span class="faq-a-label">A.</span>
                <span class="faq-a-text">${faq.answer}</span>
            </div>
        </div>
    `).join('');

    // 모든 faq-list 컨테이너에 렌더링 (여러 페이지에 있을 수 있음)
    const lists = document.querySelectorAll('#faqList, .faq-list');
    console.log(`[renderFAQ] Found ${lists.length} FAQ containers`);

    lists.forEach((list, listIndex) => {
        console.log(`[renderFAQ] Rendering to container ${listIndex + 1}:`, list);
        list.innerHTML = html;

        // 아코디언 클릭 이벤트 (각 list 내부의 카드에만)
        list.querySelectorAll('.faq-card').forEach(card => {
            // 이미 이벤트가 추가되었는지 확인
            if (card.hasAttribute('data-event-added')) return;
            card.setAttribute('data-event-added', 'true');

            card.addEventListener('click', function () {
                const isActive = this.classList.contains('active');

                // 같은 list 내의 다른 카드들만 닫기
                list.querySelectorAll('.faq-card').forEach(c => c.classList.remove('active'));

                // 클릭한 카드만 토글
                if (!isActive) {
                    this.classList.add('active');
                }
            });
        });
    });

    console.log('[renderFAQ] Rendering complete');
}

// --- REVIEWS VIEW LOGIC ---

function getReviews() {
    const local = localStorage.getItem('carDB');
    if (local) {
        const db = JSON.parse(local);
        return db.reviews || [];
    }
    return [];
}

function renderReviews() {
    const reviews = getReviews();
    const container = document.getElementById('reviewsList');

    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>아직 등록된 출고 후기가 없습니다.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            ${review.image ? `
                <div class="review-image">
                    <img src="${review.image}" alt="${review.carName}">
                </div>
            ` : ''}
            <div class="review-content">
                <div class="review-header">
                    <div class="review-car-info">
                        <span class="review-brand">${getBrandName(review.carBrand)}</span>
                        <h3 class="review-car-name">${review.carName}</h3>
                    </div>
                    <div class="review-rating">
                        ${generateStars(review.rating)}
                    </div>
                </div>
                <p class="review-text">${review.content}</p>
                <div class="review-footer">
                    <span class="review-author">${review.customerName}</span>
                    <span class="review-date">${review.date}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getBrandName(brandId) {
    const brandMap = {
        hyundai: '현대',
        kia: '기아',
        genesis: '제네시스',
        benz: '벤츠',
        bmw: 'BMW'
    };
    return brandMap[brandId] || brandId;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Animation Styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);

// ========================================
// 📱 Customer Login System
// ========================================

const LOGIN_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let logoutTimer; // Global variable to hold the logout timer ID
let remainingTimeInterval; // Global variable for remaining time update interval

// Check login status on page load
function checkLoginStatus() {
    const data = localStorage.getItem('customerLogin');
    if (!data) {
        showLoginPopup();
        return false;
    }

    const { loginTime, phone } = JSON.parse(data);
    const elapsed = Date.now() - loginTime;

    if (elapsed >= LOGIN_DURATION) {
        // Session expired
        localStorage.removeItem('customerLogin');
        showLoginPopup();
        return false;
    }

    // Still logged in
    updateLoginDisplay(phone);

    // Schedule auto-logout when session expires
    const remaining = LOGIN_DURATION - elapsed;
    scheduleAutoLogout(phone, remaining);

    return true;
}

// Show login popup
function showLoginPopup() {
    document.getElementById('loginOverlay').classList.add('active');
    document.getElementById('loginPopup').classList.add('active');
}

// Close login popup (only if clicking overlay, not popup content)
function closeLoginPopup(event) {
    if (event && event.target.id === 'loginOverlay') {
        // Don't close - user must login
        // Optional: shake animation to indicate they must login
    }
}

// Handle login
function handleLogin() {
    const phoneInput = document.getElementById('phoneInput');
    const phone = phoneInput.value.replace(/[^0-9]/g, '');

    if (phone.length !== 8) {
        alert('전화번호 뒷자리 8자리를 정확히 입력해주세요.');
        phoneInput.focus();
        return;
    }

    // Format: 1234-5678
    const formattedPhone = phone.substring(0, 4) + '-' + phone.substring(4, 8);
    const fullPhone = '010-' + formattedPhone;

    // Check if phone matches any inquiry
    const inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const matchedInquiry = inquiries.find(i => i.phone === fullPhone);

    // 신규 DB에 없는 번호는 로그인 불가
    if (!matchedInquiry) {
        alert('등록되지 않은 번호입니다.\n랜딩페이지에서 상담 신청 후 이용해주세요.');
        phoneInput.value = '';
        phoneInput.focus();
        return;
    }

    // 인증 처리
    if (!matchedInquiry.verified) {
        matchedInquiry.verified = true;
        localStorage.setItem('inquiries', JSON.stringify(inquiries));
    }

    // Save to localStorage
    localStorage.setItem('customerLogin', JSON.stringify({
        phone: formattedPhone,
        loginTime: Date.now()
    }));

    // Close popup
    document.getElementById('loginOverlay').classList.remove('active');
    document.getElementById('loginPopup').classList.remove('active');

    // Update display
    updateLoginDisplay(formattedPhone);

    // Schedule auto-logout
    scheduleAutoLogout(formattedPhone, LOGIN_DURATION);
}

// Update login status display
function updateLoginDisplay(phone) {
    const loginInfoSection = document.getElementById('loginInfoSection');
    const loginStatusText = document.getElementById('loginStatusText');

    if (!loginInfoSection || !loginStatusText) return;

    if (phone) {
        // 전화번호 뒷 4자리만 추출
        const last4Digits = phone.replace(/[^0-9]/g, '').slice(-4);
        loginStatusText.textContent = `${last4Digits} 로그인 중`;
        loginInfoSection.style.display = 'block';

        // 남은 시간 업데이트 시작
        startRemainingTimeUpdate();
    } else {
        loginStatusText.textContent = '';
        loginInfoSection.style.display = 'none';

        // 남은 시간 업데이트 정지
        stopRemainingTimeUpdate();
    }
}

// 남은 시간 업데이트 시작
function startRemainingTimeUpdate() {
    // 기존 인터벌 정리
    stopRemainingTimeUpdate();

    // 즉시 한 번 업데이트
    updateRemainingTime();

    // 1초마다 업데이트
    remainingTimeInterval = setInterval(updateRemainingTime, 1000);
}

// 남은 시간 업데이트 정지
function stopRemainingTimeUpdate() {
    if (remainingTimeInterval) {
        clearInterval(remainingTimeInterval);
        remainingTimeInterval = null;
    }
}

// 남은 시간 계산 및 표시
function updateRemainingTime() {
    const loginData = JSON.parse(localStorage.getItem('customerLogin') || '{}');
    const loginStatusText = document.getElementById('loginStatusText');

    if (!loginData.loginTime || !loginStatusText) {
        stopRemainingTimeUpdate();
        return;
    }

    const elapsed = Date.now() - loginData.loginTime;
    const remaining = LOGIN_DURATION - elapsed;

    if (remaining <= 0) {
        // 세션 만료
        stopRemainingTimeUpdate();
        return;
    }

    // 남은 시간을 분:초로 변환
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // 전화번호 뒷 4자리
    const last4Digits = loginData.phone.replace(/[^0-9]/g, '').slice(-4);

    // 텍스트 업데이트
    loginStatusText.textContent = `${last4Digits} 로그인 중 (${timeString} 남음)`;
}

// Schedules the auto-logout timer
function scheduleAutoLogout(phone, remainingTime = LOGIN_DURATION) {
    if (logoutTimer) {
        clearTimeout(logoutTimer); // Clear any existing timer
    }

    logoutTimer = setTimeout(() => {
        // 남은 시간 업데이트 정지
        stopRemainingTimeUpdate();

        // 로그아웃 처리
        localStorage.removeItem('customerLogin');
        showLoginPopup();
        updateLoginDisplay(null);

        // Toast 메시지
        if (window.Toast) {
            Toast.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
    }, remainingTime);
}

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        // 타이머 정리
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            logoutTimer = null;
        }

        // 남은 시간 업데이트 정지
        stopRemainingTimeUpdate();

        // 로컬 스토리지에서 로그인 정보 제거
        localStorage.removeItem('customerLogin');

        // UI 업데이트
        updateLoginDisplay(null);

        // 로그인 팝업 표시
        showLoginPopup();

        // Toast 메시지
        if (window.Toast) {
            Toast.info('로그아웃되었습니다.');
        }
    }
}

// 로그인 연장 함수
function extendLogin() {
    const loginData = JSON.parse(localStorage.getItem('customerLogin') || '{}');

    if (!loginData.phone) {
        if (window.Toast) {
            Toast.error('로그인 정보를 찾을 수 없습니다.');
        }
        return;
    }

    // 로그인 시간 연장 (현재 시간으로 갱신)
    const newLoginTime = Date.now();
    loginData.loginTime = newLoginTime;
    localStorage.setItem('customerLogin', JSON.stringify(loginData));

    // 자동 로그아웃 타이머 재설정
    scheduleAutoLogout(loginData.phone, LOGIN_DURATION);

    // 남은 시간 업데이트 재시작
    startRemainingTimeUpdate();

    // Toast 메시지
    if (window.Toast) {
        Toast.success('로그인 시간이 1시간 연장되었습니다!');
    }
}

// Format phone input with dash
function formatPhoneInput(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 4) {
        value = value.substring(0, 4) + '-' + value.substring(4, 8);
    }
    input.value = value;
}

// Toggle warning accordion
function toggleWarning(btn) {
    const item = btn.parentElement;
    item.classList.toggle('active');
}

// Initialize login check on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Check login after a short delay to let other init functions run
    setTimeout(checkLoginStatus, 100);
});

// 견적요청 함수
function requestQuote() {
    // 현재 선택된 차량 정보 확인
    if (!window.selectedCar) {
        Toast.error('차량 정보를 불러올 수 없습니다.');
        return;
    }

    // 선택된 옵션 확인
    const selectedOptions = document.querySelectorAll('.option-item.selected');
    if (selectedOptions.length === 0) {
        Toast.warning('선택된 옵션이 없습니다.');
        return;
    }

    // 로그인 확인
    const loginData = localStorage.getItem('customerLogin');
    if (!loginData) {
        Toast.warning('로그인이 필요합니다.');
        showLoginPopup();
        return;
    }

    const { phone } = JSON.parse(loginData);

    // 옵션 정보 수집
    const options = Array.from(selectedOptions).map(opt => ({
        name: opt.querySelector('.opt-name').textContent,
        price: parseInt(opt.dataset.price || 0)
    }));

    // 총 가격 계산
    const basePrice = window.selectedCar.price;
    const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
    const totalPrice = basePrice + optionsTotal;

    // 견적 정보 객체
    const quoteData = {
        id: 'quote_' + Date.now(),
        timestamp: Date.now(),
        car: {
            id: window.selectedCar.id,
            brand: window.selectedCar.brand,
            name: window.selectedCar.name,
            grade: window.selectedCar.grade,
            mileage: window.selectedCar.mileage,
            image: window.selectedCar.image,
            basePrice: basePrice
        },
        options: options,
        totalPrice: totalPrice,
        customerPhone: phone
    };

    // 견적 저장 (localStorage)
    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    quotes.push(quoteData);
    localStorage.setItem('savedQuotes', JSON.stringify(quotes));

    // 성공 메시지
    Toast.success('견적이 저장되었습니다! 견적 보관함에서 확인하세요.');

    // 견적 보관함으로 이동 (선택사항)
    setTimeout(() => {
        if (confirm('견적 보관함으로 이동하시겠습니까?')) {
            switchTab('nav-quotes');
        }
    }, 1000);
}