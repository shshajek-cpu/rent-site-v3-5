# 🎯 Car Manager - 전체 시스템 개선 설계도

> **작성일**: 2025-12-27
> **목적**: 안티그래비티(Claude)에게 작업 요청 시 사용할 상세 설계 문서
> **현재 상태**: 어드민 시스템 완료, 메인 사이트 개선 필요

---

## 📋 목차

1. [A. 메인 사이트 개선](#a-메인-사이트-개선)
2. [B. 특정 기능 추가 개발](#b-특정-기능-추가-개발)
3. [C. 백엔드 서버 구축](#c-백엔드-서버-구축)
4. [D. 통합 및 최종 개선](#d-통합-및-최종-개선)

---

# A. 메인 사이트 개선

## 📌 작업 개요

**현재 상태**: `index.html`, `script.js`, `style.css`로 구성된 기본 차량 목록 사이트
**목표**: 사용자 친화적이고 현대적인 차량 검색/필터링 사이트로 전면 개선

---

## 🎯 개선 우선순위

| 우선순위 | 기능 | 난이도 | 예상 시간 |
|---------|------|--------|----------|
| 1 | 고급 필터링 시스템 | 중 | 2-3시간 |
| 2 | 차량 상세 모달 | 하 | 1-2시간 |
| 3 | 즐겨찾기 기능 | 중 | 1-2시간 |
| 4 | 정렬 기능 | 하 | 1시간 |
| 5 | 페이지네이션 | 중 | 1-2시간 |
| 6 | 다크모드 | 하 | 1시간 |
| 7 | 비교 기능 | 중 | 2-3시간 |
| 8 | 반응형 개선 | 중 | 2시간 |

---

## 📝 상세 기능 명세

### 0. 차량 리스트 상단 검색 섹션 (신규 추가)

#### 요구사항
```
위치: 브랜드 필터 바로 아래, 차량 카드 리스트 바로 위
디자인: 토스/네이버 스타일의 심플한 검색바
기능:
  - 고정된 검색 섹션 (항상 표시)
  - 실시간 검색 (타이핑할 때마다 결과 업데이트)
  - 🎯 핵심: 현재 선택된 브랜드 필터 내에서만 검색
    예) BMW 선택 시 → BMW 차량만 검색
        전체 선택 시 → 모든 차량 검색
  - 차량명, 등급으로 검색
  - 검색 결과 개수 표시
  - 검색어 입력 시 차량 카드에 하이라이트
  - 검색어 지우기 버튼 (X)
  - 검색 결과 없을 때 안내 메시지
  - 모바일 친화적 UI
```

#### 동작 원리
```
1. 브랜드 필터 선택 → 해당 브랜드 차량만 표시
2. 검색어 입력 → 표시된 차량 중에서만 검색 (브랜드 필터 유지)
3. 검색어 삭제 → 현재 브랜드 필터의 전체 차량 다시 표시

예시 시나리오:
- 사용자가 'BMW' 브랜드 선택 → BMW 차량 10대 표시
- 검색창에 'X5' 입력 → BMW X5 모델만 표시 (다른 브랜드의 X5는 제외)
- 검색어 지우기 → 다시 BMW 차량 10대 전체 표시
```

#### 파일 수정
```
index.html:
  - 브랜드 필터 아래에 <div class="search-section"> 추가
  - 검색 입력창, 아이콘, 지우기 버튼 추가
  - 검색 결과 개수 표시 영역 추가
  - 차량 리스트 영역은 그대로 유지

script.js:
  - currentSearchKeyword 변수 추가 (현재 검색어 저장)
  - searchInCurrentBrand(keyword) 함수 추가
  - clearSearch() 함수 추가
  - renderFilteredCars() 함수 수정 (검색어 + 브랜드 필터 통합)
  - updateSearchResultCount() 함수 추가
  - highlightSearchTerm() 함수 추가 (카드에 하이라이트)

style.css:
  - .search-section 스타일 (토스/네이버 스타일)
  - .search-input-container 스타일
  - .search-result-summary 스타일
  - 하이라이트 효과
  - 반응형 디자인
```

#### 구현 예시
```javascript
// script.js 추가 코드

// 전역 변수
let currentBrand = 'all';        // 현재 선택된 브랜드
let currentSearchKeyword = '';   // 현재 검색어

// 🎯 브랜드 필터 내에서 검색
function searchInCurrentBrand(keyword) {
  const db = getDB();
  currentSearchKeyword = keyword.trim();

  // 1단계: 브랜드 필터 적용
  let filteredCars = currentBrand === 'all'
    ? db.cars
    : db.cars.filter(car => car.brand === currentBrand);

  // 2단계: 검색어가 있으면 추가 필터링
  if (currentSearchKeyword) {
    const searchLower = currentSearchKeyword.toLowerCase();
    filteredCars = filteredCars.filter(car => {
      return (
        car.name.toLowerCase().includes(searchLower) ||
        car.grade?.toLowerCase().includes(searchLower) ||
        car.model?.toLowerCase().includes(searchLower)
      );
    });
  }

  // 3단계: 결과 렌더링
  renderCarList(filteredCars);
  updateSearchResultSummary(filteredCars.length);

  // 4단계: X 버튼 표시/숨김
  toggleClearButton(currentSearchKeyword);

  return filteredCars;
}

// 검색어 지우기
function clearSearch() {
  currentSearchKeyword = '';
  document.getElementById('mainSearchInput').value = '';

  // 현재 브랜드의 전체 차량 다시 표시
  searchInCurrentBrand('');
}

// 브랜드 필터 변경 시 (기존 함수 수정)
function onBrandFilterChange(brandName) {
  currentBrand = brandName;

  // 검색어가 있으면 해당 검색어 유지하면서 브랜드 변경
  searchInCurrentBrand(currentSearchKeyword);

  // 브랜드 필터 UI 업데이트
  updateBrandFilterUI(brandName);
}

// 검색 결과 요약 업데이트
function updateSearchResultSummary(count) {
  const summaryEl = document.getElementById('searchResultSummary');

  if (currentSearchKeyword) {
    // 검색어가 있을 때
    summaryEl.innerHTML = `
      <i class="fas fa-search"></i>
      '<strong>${currentSearchKeyword}</strong>' 검색 결과
      <span class="count">${count}대</span>
    `;
    summaryEl.classList.add('active');
  } else {
    // 검색어가 없을 때
    const brandText = currentBrand === 'all' ? '전체' : currentBrand;
    summaryEl.innerHTML = `
      <i class="fas fa-car"></i>
      ${brandText} 차량
      <span class="count">${count}대</span>
    `;
    summaryEl.classList.remove('active');
  }
}

// X 버튼 표시/숨김
function toggleClearButton(keyword) {
  const clearBtn = document.querySelector('.search-clear-btn');

  if (keyword) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
}

// 차량 카드 렌더링 (검색어 하이라이트 추가)
function renderCarList(cars) {
  const carListEl = document.getElementById('carList');

  if (cars.length === 0) {
    carListEl.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>검색 결과가 없습니다</p>
        <button onclick="clearSearch()" class="btn-reset-search">
          검색어 지우기
        </button>
      </div>
    `;
    return;
  }

  const html = cars.map(car => {
    // 검색어 하이라이트
    const highlightedName = highlightSearchTerm(car.name, currentSearchKeyword);
    const highlightedGrade = highlightSearchTerm(car.grade || '', currentSearchKeyword);

    return `
      <div class="car-card" data-id="${car.id}" onclick="openCarDetail('${car.id}')">
        <div class="car-image">
          <img src="${car.image || '/assets/placeholder.png'}" alt="${car.name}">
        </div>
        <div class="car-info">
          <span class="car-brand">${car.brand}</span>
          <h3 class="car-name">${highlightedName}</h3>
          <p class="car-grade">${highlightedGrade}</p>
          <div class="car-price">
            <span class="price-amount">${car.price.toLocaleString()}원</span>
            <span class="price-period">/월</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  carListEl.innerHTML = html;
}

// 검색어 하이라이트
function highlightSearchTerm(text, keyword) {
  if (!keyword || !text) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 검색 입력창 이벤트 리스너
  const searchInput = document.getElementById('mainSearchInput');

  searchInput.addEventListener('input', (e) => {
    searchInCurrentBrand(e.target.value);
  });

  // Enter 키 처리 (선택사항)
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // 키보드 숨기기 (모바일)
    }
  });
});
```

#### 로직 플로우차트
```
사용자 액션                     시스템 동작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 페이지 로드              → currentBrand = 'all'
                           → currentSearchKeyword = ''
                           → 전체 차량 표시

2. 'BMW' 브랜드 클릭        → currentBrand = 'BMW'
                           → BMW 차량만 표시 (10대)
                           → "BMW 차량 10대" 표시

3. 검색창에 'X5' 입력       → currentSearchKeyword = 'X5'
                           → BMW 차량 중 X5만 필터링 (2대)
                           → "'X5' 검색 결과 2대" 표시
                           → X 버튼 표시

4. X 버튼 클릭              → currentSearchKeyword = ''
                           → BMW 전체 차량 다시 표시 (10대)
                           → "BMW 차량 10대" 표시

5. '전체' 브랜드 클릭       → currentBrand = 'all'
                           → 전체 차량 표시
                           → "전체 차량 50대" 표시
```

#### HTML 구조
```html
<!-- index.html 수정 -->

<section id="view-home" class="view-section active">
  <header class="app-header">
    <div class="header-inner">
      <button class="icon-btn" aria-label="메뉴"><i class="fas fa-bars"></i></button>
      <h1 class="page-title">차량 견적 리스트</h1>
      <button class="icon-btn" aria-label="알림"><i class="fas fa-bell"></i></button>
    </div>

    <!-- 브랜드 필터 (기존 유지) -->
    <div class="brand-scroll-area">
      <div class="brand-filter" id="brandFilter">
        <!-- Brand items injected by JS -->
      </div>
    </div>
  </header>

  <!-- 🎯 검색 섹션 (신규 추가) -->
  <div class="search-section">
    <div class="search-input-container">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        id="mainSearchInput"
        class="search-input"
        placeholder="차량명, 등급 검색..."
        autocomplete="off"
      />
      <button class="search-clear-btn" onclick="clearSearch()">
        <i class="fas fa-times-circle"></i>
      </button>
    </div>

    <!-- 검색 결과 요약 -->
    <div class="search-result-summary" id="searchResultSummary">
      <i class="fas fa-car"></i>
      전체 차량 <span class="count">0대</span>
    </div>
  </div>

  <!-- 차량 리스트 (기존 유지) -->
  <main class="car-list-container">
    <div id="carList" class="car-grid">
      <!-- Car cards injected by JS -->
    </div>
  </main>

  <!-- Admin Link Button (기존 유지) -->
  <a href="admin.html" class="admin-float-btn" title="관리자 페이지로 이동">
    <i class="fas fa-cog"></i>
  </a>
</section>
```

#### CSS 스타일
```css
/* 검색 섹션 (토스/네이버 스타일) */
.search-section {
  background: white;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #F2F2F7;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 검색 입력 컨테이너 */
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #F2F2F7;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.search-input-container:focus-within {
  background: #E5E5EA;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* 검색 아이콘 */
.search-icon {
  color: #8E8E93;
  font-size: 16px;
  margin-right: 10px;
  flex-shrink: 0;
}

/* 검색 입력창 */
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont;
  color: #1C1C1E;
  outline: none;
  padding: 0;
}

.search-input::placeholder {
  color: #8E8E93;
}

/* 검색어 지우기 버튼 */
.search-clear-btn {
  background: none;
  border: none;
  color: #8E8E93;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  flex-shrink: 0;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.search-clear-btn.visible {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}

.search-clear-btn:hover {
  color: #FF3B30;
}

/* 검색 결과 요약 */
.search-result-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 14px;
  color: #8E8E93;
  transition: all 0.2s ease;
}

.search-result-summary.active {
  color: #007AFF;
}

.search-result-summary i {
  font-size: 14px;
}

.search-result-summary strong {
  color: #1C1C1E;
  font-weight: 600;
}

.search-result-summary .count {
  margin-left: auto;
  font-weight: 700;
  color: #007AFF;
  font-size: 15px;
}

/* 검색어 하이라이트 (차량 카드 내) */
.search-highlight {
  background: linear-gradient(135deg, #FFD60A 0%, #FFC107 100%);
  color: #1C1C1E;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(255, 214, 10, 0.3);
}

/* 빈 상태 (검색 결과 없음) */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 64px;
  color: #E5E5EA;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 16px;
  color: #8E8E93;
  margin-bottom: 24px;
}

.btn-reset-search {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
  transition: all 0.2s ease;
}

.btn-reset-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.35);
}

.btn-reset-search:active {
  transform: translateY(0);
}

/* 반응형 */
@media (max-width: 480px) {
  .search-section {
    padding: 12px 16px 10px;
  }

  .search-input-container {
    padding: 10px 14px;
  }

  .search-input {
    font-size: 15px;
  }

  .search-result-summary {
    font-size: 13px;
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-section {
  animation: fadeIn 0.3s ease-out;
}
```

---

### 1. 고급 필터링 시스템

#### 요구사항
```
위치: index.html에 필터 버튼 추가 → 클릭 시 하단 시트 표시
기능:
  - 브랜드 다중 선택 (체크박스)
  - 가격 범위 슬라이더 (0 ~ 2,000,000원)
  - 주행거리 필터 (신차 / 1만km 이하 / 5만km 이하 / 전체)
  - 연료 타입 선택 (가솔린, 디젤, 하이브리드, 전기)
  - 필터 리셋 버튼
  - 적용 버튼
  - 현재 적용된 필터 개수 배지 표시
```

#### 파일 수정
```
index.html:
  - 헤더에 필터 버튼 추가 (필터 개수 배지 포함)
  - <div class="filter-overlay"> 추가 (배경 어두운 효과)
  - <div class="filter-bottom-sheet"> 추가 (하단에서 올라오는 시트)
  - 브랜드 체크박스 그룹
  - 가격 범위 슬라이더 (네이티브 range input 사용)
  - 주행거리 라디오 버튼
  - 연료 타입 선택
  - 초기화 및 적용 버튼

script.js:
  - openFilterSheet() 함수 추가
  - closeFilterSheet() 함수 추가
  - applyFilters() 함수 추가
  - resetFilters() 함수 추가
  - filterCars() 함수 추가
  - updateFilterBadge() 함수 추가
  - 필터 상태 관리 객체 생성

style.css:
  - .filter-overlay 스타일
  - .filter-bottom-sheet 스타일 (슬라이드 업 애니메이션)
  - 슬라이더 커스텀 스타일
  - 체크박스/라디오 버튼 디자인
  - 필터 배지 스타일
```

#### 구현 예시
```javascript
// script.js 추가 코드

const filterState = {
    brands: [],           // 선택된 브랜드 배열 (예: ['BMW', 'Tesla'])
    priceRange: [0, 2000000],  // 가격 범위
    mileage: 'all',       // 'new', 'under10k', 'under50k', 'all'
    fuelType: []          // 연료 타입 배열 (예: ['가솔린', '전기'])
};

// 필터 시트 열기
function openFilterSheet() {
    const overlay = document.querySelector('.filter-overlay');
    const sheet = document.querySelector('.filter-bottom-sheet');

    overlay.classList.add('active');
    sheet.classList.add('active');

    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 필터 시트 닫기
function closeFilterSheet() {
    const overlay = document.querySelector('.filter-overlay');
    const sheet = document.querySelector('.filter-bottom-sheet');

    overlay.classList.remove('active');
    sheet.classList.remove('active');

    // body 스크롤 복원
    document.body.style.overflow = '';
}

// 필터 적용
function applyFilters() {
    const filtered = filterCars();
    renderCarList(filtered);
    updateFilterBadge();
    closeFilterSheet();

    // 결과 개수 표시
    showToast(`${filtered.length}개의 차량이 검색되었습니다`);
}

// 필터 초기화
function resetFilters() {
    filterState.brands = [];
    filterState.priceRange = [0, 2000000];
    filterState.mileage = 'all';
    filterState.fuelType = [];

    // UI 초기화
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-radio').forEach(radio => {
        if (radio.value === 'all') radio.checked = true;
        else radio.checked = false;
    });
    document.getElementById('minPriceSlider').value = 0;
    document.getElementById('maxPriceSlider').value = 2000000;
    updatePriceDisplay(0, 2000000);

    updateFilterBadge();
}

// 차량 필터링
function filterCars() {
    const db = getDB();
    let filtered = db.cars;

    // 브랜드 필터
    if (filterState.brands.length > 0) {
        filtered = filtered.filter(car =>
            filterState.brands.includes(car.brand)
        );
    }

    // 가격 필터
    filtered = filtered.filter(car =>
        car.price >= filterState.priceRange[0] &&
        car.price <= filterState.priceRange[1]
    );

    // 주행거리 필터
    if (filterState.mileage !== 'all') {
        filtered = filtered.filter(car => {
            const mileage = car.mileage || 0;
            switch (filterState.mileage) {
                case 'new':
                    return mileage === 0;
                case 'under10k':
                    return mileage <= 10000;
                case 'under50k':
                    return mileage <= 50000;
                default:
                    return true;
            }
        });
    }

    // 연료 타입 필터
    if (filterState.fuelType.length > 0) {
        filtered = filtered.filter(car =>
            filterState.fuelType.includes(car.fuelType || '가솔린')
        );
    }

    return filtered;
}

// 필터 배지 업데이트
function updateFilterBadge() {
    let count = 0;

    if (filterState.brands.length > 0) count++;
    if (filterState.priceRange[0] > 0 || filterState.priceRange[1] < 2000000) count++;
    if (filterState.mileage !== 'all') count++;
    if (filterState.fuelType.length > 0) count++;

    const badge = document.getElementById('filterBadge');

    if (count > 0) {
        badge.textContent = count;
        badge.classList.add('active');
    } else {
        badge.classList.remove('active');
    }
}

// 브랜드 체크박스 변경 시
function onBrandChange(brandName, checked) {
    if (checked) {
        if (!filterState.brands.includes(brandName)) {
            filterState.brands.push(brandName);
        }
    } else {
        filterState.brands = filterState.brands.filter(b => b !== brandName);
    }
}

// 가격 슬라이더 변경 시
function onPriceChange() {
    const minPrice = parseInt(document.getElementById('minPriceSlider').value);
    const maxPrice = parseInt(document.getElementById('maxPriceSlider').value);

    // 최소값이 최대값보다 크지 않도록
    if (minPrice > maxPrice) {
        document.getElementById('minPriceSlider').value = maxPrice;
        filterState.priceRange = [maxPrice, maxPrice];
    } else {
        filterState.priceRange = [minPrice, maxPrice];
    }

    updatePriceDisplay(filterState.priceRange[0], filterState.priceRange[1]);
}

// 가격 표시 업데이트
function updatePriceDisplay(min, max) {
    document.getElementById('minPriceDisplay').textContent =
        (min / 10000).toFixed(0) + '만원';
    document.getElementById('maxPriceDisplay').textContent =
        (max / 10000).toFixed(0) + '만원';
}
```

#### HTML 구조
```html
<!-- index.html에 추가 -->

<!-- 헤더에 필터 버튼 추가 -->
<header class="app-header">
    <div class="header-inner">
        <button class="icon-btn" aria-label="메뉴"><i class="fas fa-bars"></i></button>
        <h1 class="page-title">차량 견적 리스트</h1>
        <button class="icon-btn" aria-label="검색" onclick="openSearchBar()">
            <i class="fas fa-search"></i>
        </button>
        <button class="icon-btn filter-btn" aria-label="필터" onclick="openFilterSheet()">
            <i class="fas fa-filter"></i>
            <span class="filter-badge" id="filterBadge">0</span>
        </button>
    </div>
</header>

<!-- 필터 오버레이 -->
<div class="filter-overlay" onclick="closeFilterSheet()"></div>

<!-- 필터 하단 시트 -->
<div class="filter-bottom-sheet">
    <div class="sheet-header">
        <h2>필터</h2>
        <button class="close-btn" onclick="closeFilterSheet()">
            <i class="fas fa-times"></i>
        </button>
    </div>

    <div class="sheet-content">
        <!-- 브랜드 필터 -->
        <div class="filter-section">
            <h3 class="filter-title">브랜드</h3>
            <div class="filter-options">
                <label class="checkbox-label">
                    <input type="checkbox" class="filter-checkbox" value="BMW" onchange="onBrandChange('BMW', this.checked)">
                    <span>BMW</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="filter-checkbox" value="Tesla" onchange="onBrandChange('Tesla', this.checked)">
                    <span>Tesla</span>
                </label>
                <!-- 더 많은 브랜드... -->
            </div>
        </div>

        <!-- 가격 범위 필터 -->
        <div class="filter-section">
            <h3 class="filter-title">가격 범위</h3>
            <div class="price-display">
                <span id="minPriceDisplay">0만원</span>
                <span>~</span>
                <span id="maxPriceDisplay">200만원</span>
            </div>
            <div class="range-inputs">
                <input type="range" id="minPriceSlider" min="0" max="2000000" step="50000" value="0" oninput="onPriceChange()">
                <input type="range" id="maxPriceSlider" min="0" max="2000000" step="50000" value="2000000" oninput="onPriceChange()">
            </div>
        </div>

        <!-- 주행거리 필터 -->
        <div class="filter-section">
            <h3 class="filter-title">주행거리</h3>
            <div class="filter-options">
                <label class="radio-label">
                    <input type="radio" class="filter-radio" name="mileage" value="all" checked onchange="filterState.mileage = this.value">
                    <span>전체</span>
                </label>
                <label class="radio-label">
                    <input type="radio" class="filter-radio" name="mileage" value="new" onchange="filterState.mileage = this.value">
                    <span>신차</span>
                </label>
                <label class="radio-label">
                    <input type="radio" class="filter-radio" name="mileage" value="under10k" onchange="filterState.mileage = this.value">
                    <span>1만km 이하</span>
                </label>
                <label class="radio-label">
                    <input type="radio" class="filter-radio" name="mileage" value="under50k" onchange="filterState.mileage = this.value">
                    <span>5만km 이하</span>
                </label>
            </div>
        </div>

        <!-- 연료 타입 필터 -->
        <div class="filter-section">
            <h3 class="filter-title">연료 타입</h3>
            <div class="filter-options">
                <label class="checkbox-label">
                    <input type="checkbox" class="filter-checkbox" value="가솔린" onchange="onFuelTypeChange('가솔린', this.checked)">
                    <span>가솔린</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="filter-checkbox" value="디젤" onchange="onFuelTypeChange('디젤', this.checked)">
                    <span>디젤</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="filter-checkbox" value="하이브리드" onchange="onFuelTypeChange('하이브리드', this.checked)">
                    <span>하이브리드</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="filter-checkbox" value="전기" onchange="onFuelTypeChange('전기', this.checked)">
                    <span>전기</span>
                </label>
            </div>
        </div>
    </div>

    <div class="sheet-footer">
        <button class="btn-reset" onclick="resetFilters()">
            <i class="fas fa-rotate-right"></i>
            초기화
        </button>
        <button class="btn-apply" onclick="applyFilters()">
            적용하기
        </button>
    </div>
</div>
```

#### CSS 스타일
```css
/* 필터 버튼 */
.filter-btn {
    position: relative;
}

.filter-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #FF3B30;
    color: white;
    font-size: 10px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
}

.filter-badge.active {
    display: flex;
}

/* 필터 오버레이 */
.filter-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.filter-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* 필터 하단 시트 */
.filter-bottom-sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 999;
    border-radius: 24px 24px 0 0;
    max-height: 80vh;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
}

.filter-bottom-sheet.active {
    transform: translateY(0);
}

.sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #F2F2F7;
}

.sheet-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1C1C1E;
}

.sheet-content {
    padding: 24px;
    max-height: calc(80vh - 180px);
    overflow-y: auto;
}

.filter-section {
    margin-bottom: 32px;
}

.filter-section:last-child {
    margin-bottom: 0;
}

.filter-title {
    font-size: 16px;
    font-weight: 700;
    color: #1C1C1E;
    margin-bottom: 16px;
}

.filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.checkbox-label,
.radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #F2F2F7;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.checkbox-label:has(input:checked),
.radio-label:has(input:checked) {
    background: #E5F2FF;
    border-color: #007AFF;
    color: #007AFF;
    font-weight: 600;
}

.checkbox-label input,
.radio-label input {
    display: none;
}

.price-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #007AFF;
}

.range-inputs {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #E5E5EA;
    outline: none;
    -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.sheet-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #F2F2F7;
    background: white;
}

.btn-reset {
    flex: 1;
    padding: 14px;
    background: white;
    border: 1px solid #E5E5EA;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #1C1C1E;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn-apply {
    flex: 2;
    padding: 14px;
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    color: white;
    cursor: pointer;
}
```

---

### 2. 차량 상세 페이지 (새 탭)

#### 요구사항
```
기능:
  - 차량 클릭 시 새 탭에서 상세 견적 페이지 열기
  - 차량 기본 정보 (브랜드, 모델, 스펙, 가격, 주행거리)
  - 6개의 주요 섹션:
    ① 5주간 렌탈료 변화 그래프
    ② 캐피탈사 비교 (A, B, C, D 중 최저가 표시)
    ③ 캐피탈 로고 슬라이드 애니메이션
    ④ QNA 섹션
    ⑤ 개인/개인사업자/법인사업자 필요서류 안내
    ⑥ 상단 고정 견적만료 타이머 (7일 카운트다운)
```

#### 파일 구조
```
car-detail.html (신규 파일):
  - 차량 상세 견적 페이지
  - URL 파라미터로 차량 ID 전달 (예: car-detail.html?id=uuid-1234)

car-detail.css (신규 파일):
  - 상세 페이지 전용 스타일
  - 반응형 디자인
  - 그래프 및 슬라이드 스타일

car-detail.js (신규 파일):
  - 차량 정보 로드
  - 그래프 렌더링
  - 캐피탈 비교 로직
  - 타이머 관리
```

---

#### 섹션 1: 5주간 렌탈료 변화 그래프 (토스/네이버 스타일)

**요구사항**
```
기능:
  - 5주간의 렌탈료 추이를 선 그래프로 표시
  - 토스/네이버 스타일의 모던한 카드 디자인
  - 주요 지표 카드 (현재가, 최저가, 평균가, 변동률)
  - 부드러운 애니메이션과 인터랙션
  - Pretendard 폰트 사용
  - 반응형 차트
```

**폰트 추가 (HTML head)**
```html
<!-- Pretendard 폰트 (토스, 네이버 등에서 사용) -->
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
```

**HTML 구조**
```html
<!-- car-detail.html -->
<section class="price-analysis-section">
  <!-- 섹션 헤더 -->
  <div class="section-header">
    <div class="header-content">
      <h2 class="section-title">렌탈료 분석</h2>
      <p class="section-subtitle">최근 5주간의 가격 변화를 확인하세요</p>
    </div>
    <div class="period-selector">
      <button class="period-btn active" data-period="5weeks">5주</button>
      <button class="period-btn" data-period="3months">3개월</button>
      <button class="period-btn" data-period="6months">6개월</button>
    </div>
  </div>

  <!-- 주요 지표 카드 -->
  <div class="metric-cards">
    <div class="metric-card current-price">
      <div class="metric-label">현재 렌탈료</div>
      <div class="metric-value" id="currentPrice">600,000원</div>
      <div class="metric-change positive" id="priceChange">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 3L10 7L2 7L6 3Z" fill="currentColor"/>
        </svg>
        <span>3.4%</span>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">최저 렌탈료</div>
      <div class="metric-value small" id="minPrice">580,000원</div>
      <div class="metric-detail">1주차</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">평균 렌탈료</div>
      <div class="metric-value small" id="avgPrice">593,000원</div>
      <div class="metric-detail">5주 평균</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">가격 안정도</div>
      <div class="metric-value small">
        <span class="stability-badge good">양호</span>
      </div>
      <div class="metric-detail">변동폭 작음</div>
    </div>
  </div>

  <!-- 차트 카드 -->
  <div class="chart-card">
    <div class="chart-header">
      <h3>가격 추이</h3>
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot primary"></span>
          <span class="legend-label">렌탈료</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot secondary"></span>
          <span class="legend-label">평균가</span>
        </div>
      </div>
    </div>
    <div class="chart-wrapper">
      <canvas id="priceChart"></canvas>
    </div>
  </div>

  <!-- 인사이트 카드 -->
  <div class="insight-card">
    <div class="insight-icon">💡</div>
    <div class="insight-content">
      <h4 class="insight-title">가격 분석</h4>
      <p class="insight-text" id="insightText">
        최근 5주간 렌탈료가 <strong>3.4% 상승</strong>했어요.
        평균 대비 현재 가격이 <strong>1.2% 높은</strong> 수준이에요.
      </p>
    </div>
  </div>
</section>
```

**⚠️ 가격 생성 로직 (필수 구현)**
```
🎯 목적: 실제 시장 가격처럼 오르락내리락하는 패턴으로 신뢰도 향상
        단순 상승만 하면 조작된 것처럼 보이므로 자연스러운 변동성 추가

📌 핵심 규칙:
1. 5주차(현재) = 차량의 실제 렌탈료 (고정)
2. 1~4주차 = 현재 렌탈료 기준 ±3,000 ~ ±6,000원 범위에서 랜덤 생성
3. 각 주차가 독립적으로 변동 (오르기도 하고 내리기도 함)
4. 고객(브라우저 세션)마다 다른 랜덤 패턴 생성
5. 실제 시장처럼 보이도록 자연스러운 등락 구현

📐 생성 알고리즘:
Step 1) 현재 차량의 렌탈료를 가져옴 (예: 600,000원)
Step 2) 5주차(현재) = 현재 렌탈료 (고정값)

Step 3) 1~4주차 각각 랜덤 변동 생성:
  for (let week = 1; week <= 4; week++) {
    // -6000 ~ +6000 사이의 랜덤 값 생성
    const randomChange = Math.floor(Math.random() * 13) - 6; // -6 ~ +6
    const priceChange = randomChange * 1000; // -6000 ~ +6000

    weekPrice = currentPrice + priceChange;
  }

💡 더 정교한 알고리즘 (3,000~6,000원 범위):
  // 양수(상승) 또는 음수(하락) 랜덤 결정
  const isIncrease = Math.random() > 0.5;

  // 3,000 ~ 6,000 사이의 변동폭
  const changeAmount = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;

  // 최종 가격 = 현재가 ± 변동폭
  const weekPrice = currentPrice + (isIncrease ? changeAmount : -changeAmount);

💡 예시 결과 (자연스러운 등락):
- 현재 렌탈료: 600,000원
- 1주차: 595,200원 (현재보다 -4,800원) ← 하락
- 2주차: 603,500원 (현재보다 +3,500원) ← 상승
- 3주차: 598,700원 (현재보다 -1,300원) ← 하락
- 4주차: 604,200원 (현재보다 +4,200원) ← 상승
- 5주차: 600,000원 (현재) ← 하락

📊 패턴 시각화:
      ↗ 604,200 (4주차)
         ↘
    ↗ 603,500 (2주차)         600,000 (5주차, 현재)
       ↘                    ↙
         598,700 (3주차)  ↗
       ↙
  595,200 (1주차)

✅ 검증 포인트:
- 5주차는 항상 현재 렌탈료로 고정
- 1~4주차는 현재가 대비 ±3,000 ~ ±6,000원 범위
- 상승과 하락이 랜덤하게 섞여 있음
- 브라우저 새로고침 시마다 완전히 다른 패턴
- "오르락내리락하니까 실제 시장 가격이구나" 라는 신뢰 형성
```

**JavaScript 구현 (모던 스타일)**
```javascript
// car-detail.js

// 🎯 5주간 가격 히스토리 생성 함수 (자연스러운 등락 패턴)
function generatePriceHistory(currentPrice) {
  // currentPrice = 현재 차량의 렌탈료 (예: 600000)

  const prices = [];

  // 1~4주차: 현재가 기준 ±3,000~6,000원 랜덤 변동
  for (let week = 1; week <= 4; week++) {
    // 상승(true) 또는 하락(false) 랜덤 결정
    const isIncrease = Math.random() > 0.5;

    // 3,000 ~ 6,000원 사이의 변동폭
    const changeAmount = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;

    // 현재가 기준으로 ±변동
    const weekPrice = currentPrice + (isIncrease ? changeAmount : -changeAmount);

    prices.push({
      week: `${week}주차`,
      price: weekPrice,
      date: getWeekDate(week) // 날짜 계산 함수
    });
  }

  // 5주차: 현재 렌탈료 (고정)
  prices.push({
    week: '5주차',
    price: currentPrice,
    date: getWeekDate(5)
  });

  return prices;

  // 결과 예시 (오르락내리락):
  // [
  //   { week: '1주차', price: 595200, date: '11/20' }, // -4800 (하락)
  //   { week: '2주차', price: 603500, date: '11/27' }, // +3500 (상승)
  //   { week: '3주차', price: 598700, date: '12/04' }, // -1300 (하락)
  //   { week: '4주차', price: 604200, date: '12/11' }, // +4200 (상승)
  //   { week: '5주차', price: 600000, date: '12/18' }  // 현재가
  // ]
}

// 📅 주차별 날짜 계산 함수 (보조 함수)
function getWeekDate(weekNumber) {
  const today = new Date();
  const weeksAgo = 5 - weekNumber; // 1주차 = 4주 전, 5주차 = 0주 전 (오늘)
  const targetDate = new Date(today.getTime() - (weeksAgo * 7 * 24 * 60 * 60 * 1000));

  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  return `${month}/${day}`;
}

function renderPriceChart(carId) {
  // 🎯 차량 정보에서 현재 렌탈료 가져오기
  const car = getCarData(carId); // localStorage 또는 API에서 차량 정보 로드
  const currentPrice = car.price; // 예: 600000

  // 🎲 5주간 가격 히스토리 생성 (자연스러운 등락 패턴)
  const priceHistory = generatePriceHistory(currentPrice);

  // 예시 결과 (오르락내리락):
  // [
  //   { week: '1주차', price: 595200, date: '11/20' }, // -4800 (하락)
  //   { week: '2주차', price: 603500, date: '11/27' }, // +3500 (상승)
  //   { week: '3주차', price: 598700, date: '12/04' }, // -1300 (하락)
  //   { week: '4주차', price: 604200, date: '12/11' }, // +4200 (상승)
  //   { week: '5주차', price: 600000, date: '12/18' }  // 현재가
  // ];

  // 통계 계산
  const currentPrice = priceHistory[priceHistory.length - 1].price;
  const firstPrice = priceHistory[0].price;
  const avgPrice = Math.round(priceHistory.reduce((sum, d) => sum + d.price, 0) / priceHistory.length);
  const minPrice = Math.min(...priceHistory.map(d => d.price));
  const maxPrice = Math.max(...priceHistory.map(d => d.price));
  const changeRate = ((currentPrice - firstPrice) / firstPrice * 100).toFixed(1);
  const avgDiff = ((currentPrice - avgPrice) / avgPrice * 100).toFixed(1);

  // 지표 업데이트
  updateMetrics(currentPrice, minPrice, avgPrice, changeRate, avgDiff);

  // 차트 렌더링 (토스 스타일)
  const ctx = document.getElementById('priceChart').getContext('2d');

  // 그라데이션 생성
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 122, 255, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 122, 255, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: priceHistory.map(d => d.date),
      datasets: [
        {
          label: '렌탈료',
          data: priceHistory.map(d => d.price),
          borderColor: '#007AFF',
          backgroundColor: gradient,
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#007AFF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 3,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true
        },
        {
          label: '평균가',
          data: Array(priceHistory.length).fill(avgPrice),
          borderColor: '#FF9500',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [8, 4],
          pointRadius: 0,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#FFFFFF',
          titleColor: '#1C1C1E',
          bodyColor: '#1C1C1E',
          borderColor: '#E5E5EA',
          borderWidth: 1,
          padding: 16,
          bodyFont: {
            size: 14,
            family: 'Pretendard'
          },
          titleFont: {
            size: 12,
            family: 'Pretendard',
            weight: '600'
          },
          displayColors: false,
          callbacks: {
            title: (context) => {
              return priceHistory[context[0].dataIndex].week;
            },
            label: (context) => {
              return `${context.parsed.y.toLocaleString()}원`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12,
              family: 'Pretendard'
            },
            color: '#8E8E93'
          },
          border: {
            display: false
          }
        },
        y: {
          grid: {
            color: '#F2F2F7',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 12,
              family: 'Pretendard'
            },
            color: '#8E8E93',
            padding: 12,
            callback: (value) => {
              return (value / 10000).toFixed(0) + '만원';
            }
          },
          border: {
            display: false
          }
        }
      }
    }
  });

  // 인사이트 텍스트 생성
  generateInsight(changeRate, avgDiff);
}

function updateMetrics(current, min, avg, changeRate, avgDiff) {
  // 현재 렌탈료
  document.getElementById('currentPrice').textContent =
    current.toLocaleString() + '원';

  // 변동률
  const changeEl = document.getElementById('priceChange');
  const isPositive = parseFloat(changeRate) >= 0;
  changeEl.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
  changeEl.querySelector('span').textContent = Math.abs(changeRate) + '%';

  // 화살표 방향
  const arrow = changeEl.querySelector('svg path');
  if (!isPositive) {
    arrow.setAttribute('d', 'M6 9L10 5L2 5L6 9Z'); // 아래 화살표
  }

  // 최저가
  document.getElementById('minPrice').textContent =
    min.toLocaleString() + '원';

  // 평균가
  document.getElementById('avgPrice').textContent =
    avg.toLocaleString() + '원';

  // 안정도 (변동 폭에 따라)
  const volatility = (Math.abs(parseFloat(changeRate)));
  const stabilityBadge = document.querySelector('.stability-badge');

  if (volatility < 3) {
    stabilityBadge.textContent = '매우 안정';
    stabilityBadge.className = 'stability-badge excellent';
  } else if (volatility < 5) {
    stabilityBadge.textContent = '안정';
    stabilityBadge.className = 'stability-badge good';
  } else if (volatility < 8) {
    stabilityBadge.textContent = '보통';
    stabilityBadge.className = 'stability-badge moderate';
  } else {
    stabilityBadge.textContent = '변동';
    stabilityBadge.className = 'stability-badge volatile';
  }
}

function generateInsight(changeRate, avgDiff) {
  const change = parseFloat(changeRate);
  const diff = parseFloat(avgDiff);

  let insight = '최근 5주간 렌탈료가 ';

  if (Math.abs(change) < 1) {
    insight += '<strong>거의 변동이 없어요</strong>. ';
  } else if (change > 0) {
    insight += `<strong>${Math.abs(change)}% 상승</strong>했어요. `;
  } else {
    insight += `<strong>${Math.abs(change)}% 하락</strong>했어요. `;
  }

  if (Math.abs(diff) < 1) {
    insight += '평균 가격과 <strong>동일한</strong> 수준이에요.';
  } else if (diff > 0) {
    insight += `평균 대비 현재 가격이 <strong>${Math.abs(diff)}% 높은</strong> 수준이에요.`;
  } else {
    insight += `평균 대비 현재 가격이 <strong>${Math.abs(diff)}% 낮은</strong> 수준이에요.`;
  }

  document.getElementById('insightText').innerHTML = insight;
}

// 기간 선택 버튼
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    // 기간에 따라 데이터 다시 로드
    const period = e.target.dataset.period;
    loadPriceData(period);
  });
});

function loadPriceData(period) {
  // API 호출 또는 데이터 로드
  console.log(`Loading data for period: ${period}`);
  // renderPriceChart() 재호출
}
```

**CSS 스타일 (토스/네이버 스타일)**
```css
/* 기본 폰트 설정 */
* {
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo",
               "Noto Sans KR", "Malgun Gothic", sans-serif;
}

.price-analysis-section {
  padding: 32px 0;
  max-width: 1200px;
  margin: 0 auto;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1C1C1E;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.section-subtitle {
  font-size: 15px;
  color: #8E8E93;
  margin: 0;
  font-weight: 400;
}

/* 기간 선택 버튼 */
.period-selector {
  display: flex;
  gap: 8px;
  background: #F2F2F7;
  padding: 4px;
  border-radius: 12px;
}

.period-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #8E8E93;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn.active {
  background: #FFFFFF;
  color: #007AFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.period-btn:hover:not(.active) {
  color: #1C1C1E;
}

/* 지표 카드 그리드 */
.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F2F2F7;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: #E5E5EA;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.metric-card.current-price {
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  border: none;
  color: white;
}

.metric-label {
  font-size: 13px;
  font-weight: 500;
  color: #8E8E93;
  margin-bottom: 8px;
}

.metric-card.current-price .metric-label {
  color: rgba(255, 255, 255, 0.8);
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.metric-card.current-price .metric-value {
  color: #FFFFFF;
  font-size: 32px;
}

.metric-value.small {
  font-size: 24px;
}

.metric-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
}

.metric-change.positive {
  color: #FFFFFF;
}

.metric-change.negative {
  color: #FFFFFF;
}

.metric-detail {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

/* 안정도 배지 */
.stability-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.stability-badge.excellent {
  background: #E3F9E5;
  color: #30A14E;
}

.stability-badge.good {
  background: #D4EDFF;
  color: #007AFF;
}

.stability-badge.moderate {
  background: #FFF4E0;
  color: #FF9500;
}

.stability-badge.volatile {
  background: #FFE5E5;
  color: #FF3B30;
}

/* 차트 카드 */
.chart-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F2F2F7;
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1C1C1E;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.primary {
  background: #007AFF;
}

.legend-dot.secondary {
  background: #FF9500;
}

.legend-label {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

.chart-wrapper {
  height: 320px;
  position: relative;
}

/* 인사이트 카드 */
.insight-card {
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, #F5F5F7 0%, #FAFAFA 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F2F2F7;
}

.insight-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
  margin: 0 0 8px 0;
}

.insight-text {
  font-size: 15px;
  color: #3C3C43;
  line-height: 1.6;
  margin: 0;
}

.insight-text strong {
  color: #007AFF;
  font-weight: 600;
}

/* 반응형 */
@media (max-width: 768px) {
  .price-analysis-section {
    padding: 24px 16px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
  }

  .period-selector {
    width: 100%;
  }

  .period-btn {
    flex: 1;
  }

  .metric-cards {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 22px;
  }

  .metric-value {
    font-size: 24px;
  }

  .metric-card.current-price .metric-value {
    font-size: 28px;
  }

  .chart-wrapper {
    height: 280px;
  }

  .chart-legend {
    flex-direction: column;
    gap: 8px;
  }
}

/* 부드러운 애니메이션 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card,
.chart-card,
.insight-card {
  animation: slideUp 0.5s ease-out;
}

.metric-card:nth-child(1) { animation-delay: 0.1s; }
.metric-card:nth-child(2) { animation-delay: 0.2s; }
.metric-card:nth-child(3) { animation-delay: 0.3s; }
.metric-card:nth-child(4) { animation-delay: 0.4s; }
.chart-card { animation-delay: 0.5s; }
.insight-card { animation-delay: 0.6s; }
```

---

#### 섹션 2: 캐피탈사 비교 (토스/네이버 스타일)

**요구사항**
```
기능:
  - A, B, C, D 캐피탈사의 렌탈료 비교
  - 토스 스타일의 카드 디자인
  - 최저가 하이라이트 및 추천 배지
  - 각 캐피탈의 특징과 혜택 표시
  - 가격 차이 및 절약 금액 강조
  - 부드러운 애니메이션
```

**HTML 구조**
```html
<section class="capital-comparison-section">
  <div class="section-header">
    <div class="header-content">
      <h2 class="section-title">캐피탈사 비교</h2>
      <p class="section-subtitle">여러 캐피탈사의 조건을 한눈에 비교해보세요</p>
    </div>
    <button class="btn-refresh" onclick="refreshCapitalPrices()">
      <span class="refresh-icon">↻</span>
      <span>최신 가격 업데이트</span>
    </button>
  </div>

  <!-- 최저가 하이라이트 -->
  <div class="best-deal-banner">
    <div class="banner-icon">🎉</div>
    <div class="banner-content">
      <h3>오늘의 최저가</h3>
      <p><strong id="bestCapitalName">A캐피탈</strong>에서 <strong id="bestPrice">580,000원</strong>으로 이용 가능해요</p>
    </div>
    <div class="save-amount">
      <div class="save-label">최대 절약</div>
      <div class="save-value" id="saveAmount">45,000원</div>
    </div>
  </div>

  <!-- 캐피탈사 카드 그리드 -->
  <div class="capital-grid" id="capitalComparison"></div>

  <!-- 비교 안내 -->
  <div class="comparison-note">
    <p>💡 <strong>알아두세요</strong></p>
    <ul>
      <li>표시된 가격은 예상 금액이며, 신용도에 따라 달라질 수 있어요</li>
      <li>각 캐피탈사마다 프로모션 혜택이 다를 수 있으니 상담받아보세요</li>
      <li>실제 계약 전 약관을 꼼꼼히 확인하시는 것을 권장해요</li>
    </ul>
  </div>
</section>
```

**⚠️ 캐피탈사 가격 생성 로직 (필수 구현)**
```
🎯 목적: A캐피탈을 항상 최저가로 보이게 하여 고객이 해당 캐피탈을 선택하도록 유도
        동시에 가격이 10원 단위까지 세밀하게 차이나게 하여 실제 견적처럼 보이도록 신뢰도 향상

📌 핵심 규칙:
1. A캐피탈의 가격 = 현재 차량의 렌탈료 그대로 사용
2. B, C, D 캐피탈은 A캐피탈보다 10,000원 ~ 20,000원 더 비싸게 설정
3. 가격 차이는 10원 단위까지 랜덤 생성 (예: 15,370원, 18,240원)
4. 고객(브라우저 세션)마다 다른 랜덤 값으로 현실감 증가

📐 생성 알고리즘:
Step 1) A캐피탈 가격 = 현재 차량의 렌탈료 (예: 600,000원)
Step 2) B캐피탈 가격 = A캐피탈 + (Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000)
        - Math.random() * 101 로 0~100 사이 정수 생성
        - 이를 10 곱해서 0, 10, 20, 30, ..., 990, 1000 형태로 만들기
        - 최종: A캐피탈 + (10000~20000 사이 랜덤) + (0~1000 사이 10단위 랜덤)
Step 3) C캐피탈 가격 = 동일한 방식으로 생성
Step 4) D캐피탈 가격 = 동일한 방식으로 생성

💡 더 정밀한 알고리즘 (10원 단위):
randomDifference = Math.floor(Math.random() * ((20000 - 10000) / 10 + 1)) * 10 + 10000
// 10000, 10010, 10020, ..., 19990, 20000 중 하나가 선택됨

💡 예시 결과:
- A캐피탈: 600,000원 (기준)
- B캐피탈: 615,370원 (15,370원 차이) ← 10원 단위까지 다름
- C캐피탈: 618,240원 (18,240원 차이) ← 10원 단위까지 다름
- D캐피탈: 612,890원 (12,890원 차이) ← 10원 단위까지 다름

✅ 검증 포인트:
- A캐피탈이 항상 최저가
- B, C, D는 A보다 10,000 ~ 20,000원 높음
- 모든 캐피탈 가격이 10원 단위로 끝남 (예: ...370원, ...240원, ...890원)
- 브라우저 새로고침 시마다 다른 가격 생성
- 고객은 "이렇게 세밀하게 계산된 견적이라면 실제 가격이 맞겠구나" 라고 신뢰
```

**JavaScript 구현**
```javascript
// car-detail.js

// 🎯 캐피탈사 가격 데이터 생성 함수
function generateCapitalComparison(basePrice) {
  // basePrice = 현재 차량의 렌탈료 (예: 600000)

  // A캐피탈 = 기준 가격 (최저가)
  const priceA = basePrice;

  // B, C, D 캐피탈 = A캐피탈 + 10,000~20,000원 (10원 단위)
  const priceB = priceA + (Math.floor(Math.random() * 1001) * 10 + 10000);
  const priceC = priceA + (Math.floor(Math.random() * 1001) * 10 + 10000);
  const priceD = priceA + (Math.floor(Math.random() * 1001) * 10 + 10000);

  return [
    {
      name: 'A캐피탈',
      logo: '/assets/logos/capital-a.png',
      price: priceA, // 예: 600,000원
      features: ['최저금리', '빠른 승인', '24시간 상담'],
      benefits: ['첫 달 렌탈료 50% 할인', '장기 계약 시 추가 할인'],
      rating: 4.8,
      reviews: 1523
    },
    {
      name: 'B캐피탈',
      logo: '/assets/logos/capital-b.png',
      price: priceB, // 예: 615,370원
      features: ['유연한 조건', '장기 할인', '무보증'],
      benefits: ['신용점수 우대', '조기 상환 수수료 없음'],
      rating: 4.5,
      reviews: 982
    },
    {
      name: 'C캐피탈',
      logo: '/assets/logos/capital-c.png',
      price: priceC, // 예: 618,240원
      features: ['신용 무관', '당일 승인', '간편 서류'],
      benefits: ['당일 출고 가능', '무료 차량 관리'],
      rating: 4.3,
      reviews: 756
    },
    {
      name: 'D캐피탈',
      logo: '/assets/logos/capital-d.png',
      price: priceD, // 예: 612,890원
      features: ['프리미엄 서비스', 'VIP 라운지'],
      benefits: ['전담 매니저', '무료 정비 서비스'],
      rating: 4.6,
      reviews: 621
    }
  ];
}

function renderCapitalComparison(carId) {
  const container = document.getElementById('capitalComparison');

  // 🎯 차량 정보에서 현재 렌탈료 가져오기
  const car = getCarData(carId); // localStorage 또는 API에서 차량 정보 로드
  const basePrice = car.price; // 예: 600000

  // 🎲 캐피탈사 가격 데이터 동적 생성 (10원 단위 랜덤)
  const capitalComparison = generateCapitalComparison(basePrice);
  // 결과 예시:
  // A캐피탈: 600,000원
  // B캐피탈: 615,370원 (15,370원 차이)
  // C캐피탈: 618,240원 (18,240원 차이)
  // D캐피탈: 612,890원 (12,890원 차이)

  // 가장 저렴한 캐피탈 찾기 (항상 A캐피탈이 최저가가 됨)
  const cheapest = capitalComparison.reduce((min, capital) =>
    capital.price < min.price ? capital : min
  );

  const mostExpensive = capitalComparison.reduce((max, capital) =>
    capital.price > max.price ? capital : max
  );

  // 최저가 배너 업데이트
  document.getElementById('bestCapitalName').textContent = cheapest.name;
  document.getElementById('bestPrice').textContent = cheapest.price.toLocaleString() + '원';
  document.getElementById('saveAmount').textContent =
    (mostExpensive.price - cheapest.price).toLocaleString() + '원';

  // 카드 렌더링
  const html = capitalComparison.map((capital, index) => {
    const isCheapest = capital.name === cheapest.name;
    const priceDiff = capital.price - cheapest.price;
    const savingsPercent = ((priceDiff / capital.price) * 100).toFixed(1);

    return `
      <div class="capital-card ${isCheapest ? 'best-price' : ''}"
           style="animation-delay: ${index * 0.1}s">
        ${isCheapest ? `
          <div class="recommended-badge">
            <span class="badge-icon">⭐</span>
            <span>추천</span>
          </div>
        ` : ''}

        <div class="capital-header">
          <div class="capital-logo-wrapper">
            <img src="${capital.logo}" alt="${capital.name}" class="capital-logo">
          </div>
          <h3 class="capital-name">${capital.name}</h3>
          <div class="capital-rating">
            <span class="rating-stars">${'★'.repeat(Math.floor(capital.rating))}</span>
            <span class="rating-value">${capital.rating}</span>
            <span class="rating-count">(${capital.reviews.toLocaleString()})</span>
          </div>
        </div>

        <div class="capital-price-section">
          ${isCheapest ? `
            <div class="best-price-badge">최저가</div>
          ` : priceDiff > 0 ? `
            <div class="price-difference">
              +${priceDiff.toLocaleString()}원
              <span class="diff-percent">(${savingsPercent}%)</span>
            </div>
          ` : ''}
          <div class="capital-price">${capital.price.toLocaleString()}원</div>
          <div class="price-period">월 렌탈료</div>
        </div>

        <div class="capital-features">
          <div class="features-title">특징</div>
          <div class="feature-tags">
            ${capital.features.map(f =>
              `<span class="feature-tag">${f}</span>`
            ).join('')}
          </div>
        </div>

        <div class="capital-benefits">
          <div class="benefits-title">혜택</div>
          <ul class="benefit-list">
            ${capital.benefits.map(b =>
              `<li class="benefit-item">
                <span class="benefit-icon">✓</span>
                <span>${b}</span>
              </li>`
            ).join('')}
          </ul>
        </div>

        <button class="btn-capital-select ${isCheapest ? 'primary' : 'secondary'}"
                onclick="selectCapital('${capital.name}')">
          ${isCheapest ? '이 조건으로 신청하기' : '상세 보기'}
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function selectCapital(name) {
  console.log(`선택한 캐피탈: ${name}`);
  // 캐피탈 선택 로직
  alert(`${name} 상담 신청이 접수되었습니다!`);
}

function refreshCapitalPrices() {
  console.log('최신 가격 업데이트 중...');
  // API 호출하여 최신 가격 가져오기
}
```

**CSS 스타일**
```css
.capital-comparison-section {
  padding: 48px 0;
  background: #F8F9FA;
  margin: 0 -20px;
  padding: 48px 20px;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: white;
  border: 1px solid #E5E5EA;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover {
  background: #F8F9FA;
  border-color: #007AFF;
  color: #007AFF;
}

.refresh-icon {
  font-size: 16px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn-refresh:hover .refresh-icon {
  transform: rotate(180deg);
}

/* 최저가 배너 */
.best-deal-banner {
  background: linear-gradient(135deg, #34C759 0%, #30A14E 100%);
  border-radius: 20px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 24px 0 32px;
  color: white;
  box-shadow: 0 8px 24px rgba(52, 199, 89, 0.25);
}

.banner-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-content h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.95;
}

.banner-content p {
  font-size: 18px;
  margin: 0;
}

.banner-content strong {
  font-weight: 800;
}

.save-amount {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.save-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.save-value {
  font-size: 24px;
  font-weight: 800;
}

/* 캐피탈 카드 그리드 */
.capital-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.capital-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  animation: slideUpFade 0.5s ease-out;
  animation-fill-mode: both;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.capital-card:hover {
  border-color: #E5E5EA;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.capital-card.best-price {
  border-color: #34C759;
  box-shadow: 0 8px 24px rgba(52, 199, 89, 0.15);
}

.capital-card.best-price:hover {
  box-shadow: 0 12px 32px rgba(52, 199, 89, 0.25);
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 24px;
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
}

.capital-header {
  text-align: center;
  margin-bottom: 20px;
}

.capital-logo-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: #F8F9FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.capital-logo {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.capital-name {
  font-size: 20px;
  font-weight: 800;
  color: #1C1C1E;
  margin-bottom: 8px;
}

.capital-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
}

.rating-stars {
  color: #FF9500;
  font-size: 14px;
}

.rating-value {
  font-weight: 700;
  color: #1C1C1E;
}

.rating-count {
  color: #8E8E93;
}

/* 가격 섹션 */
.capital-price-section {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #F2F2F7;
  border-bottom: 1px solid #F2F2F7;
  margin-bottom: 20px;
  position: relative;
}

.best-price-badge {
  display: inline-block;
  background: #E3F9E5;
  color: #30A14E;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.price-difference {
  font-size: 13px;
  color: #FF3B30;
  font-weight: 600;
  margin-bottom: 8px;
}

.diff-percent {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 4px;
}

.capital-price {
  font-size: 32px;
  font-weight: 800;
  color: #1C1C1E;
  letter-spacing: -1px;
  margin-bottom: 4px;
}

.price-period {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

/* 특징 */
.capital-features {
  margin-bottom: 20px;
}

.features-title {
  font-size: 13px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 10px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-tag {
  display: inline-block;
  background: #F2F2F7;
  color: #1C1C1E;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

/* 혜택 */
.capital-benefits {
  margin-bottom: 20px;
}

.benefits-title {
  font-size: 13px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 10px;
}

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #3C3C43;
  margin-bottom: 8px;
  line-height: 1.4;
}

.benefit-icon {
  color: #34C759;
  font-weight: 700;
  flex-shrink: 0;
}

/* 선택 버튼 */
.btn-capital-select {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-capital-select.primary {
  background: #007AFF;
  color: white;
}

.btn-capital-select.primary:hover {
  background: #0051D5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.3);
}

.btn-capital-select.secondary {
  background: #F2F2F7;
  color: #1C1C1E;
}

.btn-capital-select.secondary:hover {
  background: #E5E5EA;
}

/* 비교 안내 */
.comparison-note {
  background: #F8F9FA;
  border-left: 4px solid #007AFF;
  border-radius: 12px;
  padding: 20px 24px;
}

.comparison-note p {
  font-size: 14px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 12px;
}

.comparison-note ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comparison-note li {
  font-size: 13px;
  color: #3C3C43;
  line-height: 1.6;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.comparison-note li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #007AFF;
  font-weight: bold;
}

/* 반응형 */
@media (max-width: 768px) {
  .capital-comparison-section {
    padding: 32px 16px;
    margin: 0 -20px;
  }

  .best-deal-banner {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .banner-content p {
    font-size: 16px;
  }

  .capital-grid {
    grid-template-columns: 1fr;
  }

  .capital-price {
    font-size: 28px;
  }
}
```

---

#### 섹션 3: 제휴 캐피탈사 소개 (토스/네이버 스타일)

**요구사항**
```
기능:
  - 토스 스타일의 깔끔한 파트너사 소개
  - 캐피탈 로고 무한 슬라이드
  - 오늘 날짜 기준 안내 문구
  - 부드러운 애니메이션
  - 마우스 호버 시 일시정지
```

**HTML 구조**
```html
<section class="capital-partners-section">
  <div class="partners-container">
    <div class="partners-header">
      <h2 class="section-title">믿을 수 있는 파트너</h2>
      <p class="section-subtitle">
        <span id="todayDate"></span> 기준,
        <strong>12개 캐피탈사</strong>와 함께 최적의 조건을 찾아드려요
      </p>
    </div>

    <!-- 통계 카드 -->
    <div class="partners-stats">
      <div class="stat-item">
        <div class="stat-icon">🤝</div>
        <div class="stat-content">
          <div class="stat-value">12개</div>
          <div class="stat-label">제휴 캐피탈사</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">✨</div>
        <div class="stat-content">
          <div class="stat-value">평균 4.6</div>
          <div class="stat-label">고객 만족도</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">24시간</div>
          <div class="stat-label">빠른 승인</div>
        </div>
      </div>
    </div>

    <!-- 로고 슬라이더 -->
    <div class="partners-slider-wrapper">
      <div class="slider-gradient left"></div>
      <div class="slider-gradient right"></div>
      <div class="partners-slider">
        <div class="slider-track" id="partnersSlider">
          <!-- JavaScript로 동적 생성 -->
        </div>
      </div>
    </div>

    <!-- 신뢰 배지 -->
    <div class="trust-badges">
      <div class="trust-badge">
        <span class="badge-icon">🔒</span>
        <span class="badge-text">금융위원회 등록</span>
      </div>
      <div class="trust-badge">
        <span class="badge-icon">✓</span>
        <span class="badge-text">개인정보 보호</span>
      </div>
      <div class="trust-badge">
        <span class="badge-icon">📋</span>
        <span class="badge-text">투명한 약관</span>
      </div>
    </div>
  </div>
</section>
```

**JavaScript 구현**
```javascript
// car-detail.js

const partnerLogos = [
  { name: 'A캐피탈', logo: '/assets/logos/capital-a.png' },
  { name: 'B캐피탈', logo: '/assets/logos/capital-b.png' },
  { name: 'C캐피탈', logo: '/assets/logos/capital-c.png' },
  { name: 'D캐피탈', logo: '/assets/logos/capital-d.png' },
  { name: 'E캐피탈', logo: '/assets/logos/capital-e.png' },
  { name: 'F캐피탈', logo: '/assets/logos/capital-f.png' },
  { name: 'G캐피탈', logo: '/assets/logos/capital-g.png' },
  { name: 'H캐피탈', logo: '/assets/logos/capital-h.png' }
];

function renderPartnersSlider() {
  const slider = document.getElementById('partnersSlider');

  // 로고를 2번 복제하여 무한 루프 효과
  const logos = [...partnerLogos, ...partnerLogos];

  const html = logos.map(partner => `
    <div class="partner-logo-item">
      <img src="${partner.logo}" alt="${partner.name}" class="partner-logo">
    </div>
  `).join('');

  slider.innerHTML = html;
}

function displayTodayDate() {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('ko-KR', options);
  document.getElementById('todayDate').textContent = dateString;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  renderPartnersSlider();
  displayTodayDate();
});
```

**CSS 스타일**
```css
.capital-partners-section {
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
  padding: 60px 0;
  margin: 48px 0;
}

.partners-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.partners-header {
  text-align: center;
  margin-bottom: 40px;
}

.partners-header .section-subtitle {
  font-size: 16px;
  color: #3C3C43;
  margin-top: 12px;
}

.partners-header strong {
  color: #007AFF;
  font-weight: 700;
}

/* 통계 카드 */
.partners-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.stat-item {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #F2F2F7;
  transition: all 0.3s ease;
}

.stat-item:hover {
  border-color: #007AFF;
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.1);
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #007AFF;
  line-height: 1;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 600;
}

/* 로고 슬라이더 */
.partners-slider-wrapper {
  position: relative;
  margin-bottom: 40px;
  padding: 40px 0;
}

.slider-gradient {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100px;
  z-index: 2;
  pointer-events: none;
}

.slider-gradient.left {
  left: 0;
  background: linear-gradient(90deg, #F8F9FA 0%, transparent 100%);
}

.slider-gradient.right {
  right: 0;
  background: linear-gradient(270deg, #F8F9FA 0%, transparent 100%);
}

.partners-slider {
  overflow: hidden;
  position: relative;
}

.slider-track {
  display: flex;
  gap: 60px;
  animation: slideLeft 30s linear infinite;
  width: fit-content;
}

.slider-track:hover {
  animation-play-state: paused;
}

@keyframes slideLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.partner-logo-item {
  flex-shrink: 0;
  width: 140px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #F2F2F7;
  transition: all 0.3s ease;
}

.partner-logo-item:hover {
  border-color: #E5E5EA;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: scale(1.05);
}

.partner-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: grayscale(100%) opacity(0.6);
  transition: filter 0.3s ease;
}

.partner-logo-item:hover .partner-logo {
  filter: grayscale(0%) opacity(1);
}

/* 신뢰 배지 */
.trust-badges {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #E5E5EA;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
}

.trust-badge .badge-icon {
  font-size: 18px;
}

/* 반응형 */
@media (max-width: 768px) {
  .capital-partners-section {
    padding: 40px 0;
  }

  .partners-stats {
    grid-template-columns: 1fr;
  }

  .stat-item {
    justify-content: center;
  }

  .partner-logo-item {
    width: 120px;
    height: 70px;
  }

  .slider-track {
    gap: 40px;
  }

  .trust-badges {
    flex-direction: column;
    align-items: stretch;
  }

  .trust-badge {
    justify-content: center;
  }
}
```

---

#### 섹션 4: 자주 묻는 질문 (토스/네이버 스타일)

**요구사항**
```
기능:
  - 토스 스타일 아코디언
  - 카테고리별 질문 분류
  - 부드러운 펼침/접힘 애니메이션
  - 검색 기능
  - 도움이 되었나요? 피드백
```

**HTML 구조**
```html
<section class="faq-section">
  <div class="faq-container">
    <div class="section-header">
      <h2 class="section-title">자주 묻는 질문</h2>
      <p class="section-subtitle">궁금하신 내용을 빠르게 찾아보세요</p>
    </div>

    <!-- 검색 -->
    <div class="faq-search">
      <input
        type="text"
        id="faqSearchInput"
        class="search-input"
        placeholder="궁금한 내용을 검색해보세요"
        oninput="searchFAQ(event)"
      >
      <span class="search-icon">🔍</span>
    </div>

    <!-- 카테고리 탭 -->
    <div class="faq-categories">
      <button class="category-tab active" data-category="all" onclick="filterCategory('all')">
        전체
      </button>
      <button class="category-tab" data-category="contract" onclick="filterCategory('contract')">
        계약/해지
      </button>
      <button class="category-tab" data-category="payment" onclick="filterCategory('payment')">
        비용/결제
      </button>
      <button class="category-tab" data-category="service" onclick="filterCategory('service')">
        서비스
      </button>
    </div>

    <!-- FAQ 리스트 -->
    <div class="faq-list" id="faqContainer">
      <!-- JavaScript로 동적 생성 -->
    </div>

    <!-- 추가 문의 -->
    <div class="faq-contact-card">
      <div class="contact-icon">💬</div>
      <div class="contact-content">
        <h3>찾으시는 답변이 없나요?</h3>
        <p>전문 상담사가 친절하게 도와드릴게요</p>
      </div>
      <button class="btn-contact" onclick="openChat()">
        1:1 상담하기
      </button>
    </div>
  </div>
</section>
```

**JavaScript 구현**
```javascript
// car-detail.js

const faqData = [
  {
    id: 1,
    category: 'contract',
    question: '렌탈과 리스의 차이는 무엇인가요?',
    answer: '렌탈은 차량을 빌려 사용하는 것으로, 소유권이 렌탈사에 있습니다. 리스는 장기 임대 후 최종적으로 차량을 인수할 수 있는 옵션이 있습니다. 렌탈은 유지보수가 포함되어 있어 편리하지만, 리스는 더 저렴한 월 비용이 장점입니다.',
    helpful: 0
  },
  {
    id: 2,
    category: 'contract',
    question: '중도 해지가 가능한가요?',
    answer: '계약 조건에 따라 다르지만, 대부분 중도 해지 시 위약금이 발생합니다. 일반적으로 계약 기간의 30~50% 경과 후 해지 가능하며, 남은 개월 수에 따라 위약금이 산정됩니다.',
    helpful: 0
  },
  {
    id: 3,
    category: 'payment',
    question: '보험은 어떻게 처리되나요?',
    answer: '렌탈료에 자차보험과 책임보험이 포함되어 있습니다. 사고 발생 시 자기부담금(일반적으로 20~50만원)만 부담하시면 됩니다. 무사고 시 다음 계약 시 할인 혜택도 제공됩니다.',
    helpful: 0
  },
  {
    id: 4,
    category: 'contract',
    question: '개인사업자도 신청 가능한가요?',
    answer: '네, 가능합니다. 개인사업자의 경우 사업자등록증, 소득증빙서류(부가세 신고서 등)를 추가로 제출하시면 됩니다. 법인사업자는 법인등록증과 재무제표가 필요합니다.',
    helpful: 0
  },
  {
    id: 5,
    category: 'service',
    question: '주행거리 제한이 있나요?',
    answer: '일반적으로 연간 2만~3만km로 제한되어 있습니다. 초과 시 km당 100~150원의 추가 비용이 발생합니다. 장거리 운행이 많으신 경우 무제한 옵션을 선택하실 수 있습니다.',
    helpful: 0
  },
  {
    id: 6,
    category: 'payment',
    question: '월 렌탈료에 무엇이 포함되나요?',
    answer: '월 렌탈료에는 차량 사용료, 자동차세, 자차/책임보험료, 정기 점검비, 긴급출동 서비스가 포함됩니다. 단, 주유비와 통행료는 별도입니다.',
    helpful: 0
  }
];

let currentCategory = 'all';

function renderFAQ(filteredData = faqData) {
  const container = document.getElementById('faqContainer');

  if (filteredData.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>검색 결과가 없습니다</p>
      </div>
    `;
    return;
  }

  const html = filteredData.map((faq, index) => `
    <div class="faq-item" data-id="${faq.id}" data-category="${faq.category}"
         style="animation-delay: ${index * 0.05}s">
      <button class="faq-question" onclick="toggleFAQ(${faq.id})">
        <span class="question-text">${faq.question}</span>
        <span class="faq-icon" id="icon-${faq.id}">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      <div class="faq-answer" id="faq-answer-${faq.id}">
        <div class="answer-content">
          <p>${faq.answer}</p>
          <div class="answer-feedback">
            <span class="feedback-label">이 답변이 도움이 되었나요?</span>
            <div class="feedback-buttons">
              <button class="btn-feedback" onclick="markHelpful(${faq.id}, true)">
                <span>👍</span>
                <span>도움돼요</span>
              </button>
              <button class="btn-feedback" onclick="markHelpful(${faq.id}, false)">
                <span>👎</span>
                <span>아니에요</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

function toggleFAQ(id) {
  const answer = document.getElementById(`faq-answer-${id}`);
  const item = answer.closest('.faq-item');
  const icon = document.getElementById(`icon-${id}`);

  const isActive = answer.classList.contains('active');

  // 다른 모든 FAQ 닫기
  document.querySelectorAll('.faq-answer.active').forEach(a => {
    a.classList.remove('active');
    const otherId = a.id.replace('faq-answer-', '');
    document.getElementById(`icon-${otherId}`).classList.remove('rotated');
  });

  // 현재 FAQ 토글
  if (!isActive) {
    answer.classList.add('active');
    icon.classList.add('rotated');
  }
}

function filterCategory(category) {
  currentCategory = category;

  // 탭 활성화
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');

  // 필터링
  const filtered = category === 'all'
    ? faqData
    : faqData.filter(faq => faq.category === category);

  renderFAQ(filtered);
}

function searchFAQ(event) {
  const searchTerm = event.target.value.toLowerCase();

  let filtered = currentCategory === 'all'
    ? faqData
    : faqData.filter(faq => faq.category === currentCategory);

  if (searchTerm) {
    filtered = filtered.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.answer.toLowerCase().includes(searchTerm)
    );
  }

  renderFAQ(filtered);
}

function markHelpful(id, isHelpful) {
  const faq = faqData.find(f => f.id === id);
  if (faq) {
    faq.helpful = isHelpful ? 1 : -1;
  }

  // 피드백 감사 메시지
  const message = isHelpful
    ? '도움이 되었다니 기뻐요! 😊'
    : '더 나은 답변을 준비할게요 💪';

  alert(message);
}

function openChat() {
  console.log('1:1 상담 시작');
  alert('상담사 연결 중입니다...');
}

// 페이지 로드 시 FAQ 렌더링
document.addEventListener('DOMContentLoaded', () => {
  renderFAQ();
});
```

**CSS 스타일**
```css
.faq-section {
  padding: 60px 0;
  background: white;
}

.faq-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 검색 */
.faq-search {
  position: relative;
  margin: 32px 0;
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  border: 2px solid #F2F2F7;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007AFF;
  background: #F8F9FA;
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  pointer-events: none;
}

/* 카테고리 탭 */
.faq-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tab {
  padding: 10px 20px;
  border: none;
  background: #F2F2F7;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #8E8E93;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.category-tab.active {
  background: #007AFF;
  color: white;
}

.category-tab:hover:not(.active) {
  background: #E5E5EA;
  color: #1C1C1E;
}

/* FAQ 아이템 */
.faq-list {
  margin-bottom: 40px;
}

.faq-item {
  background: white;
  border: 1px solid #F2F2F7;
  border-radius: 16px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeInUp 0.4s ease-out;
  animation-fill-mode: both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.faq-item:hover {
  border-color: #E5E5EA;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.faq-question {
  width: 100%;
  background: none;
  border: none;
  padding: 20px 24px;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #1C1C1E;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  gap: 16px;
}

.question-text {
  flex: 1;
  line-height: 1.5;
}

.faq-icon {
  flex-shrink: 0;
  color: #8E8E93;
  transition: transform 0.3s ease, color 0.2s ease;
  display: flex;
  align-items: center;
}

.faq-icon.rotated {
  transform: rotate(180deg);
  color: #007AFF;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.faq-answer.active {
  max-height: 800px;
}

.answer-content {
  padding: 0 24px 24px 24px;
  border-top: 1px solid #F2F2F7;
}

.answer-content p {
  color: #3C3C43;
  line-height: 1.7;
  font-size: 15px;
  margin: 20px 0;
}

/* 피드백 */
.answer-feedback {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #F2F2F7;
}

.feedback-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #8E8E93;
  margin-bottom: 12px;
}

.feedback-buttons {
  display: flex;
  gap: 8px;
}

.btn-feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #F2F2F7;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-feedback:hover {
  background: #E5E5EA;
  transform: translateY(-1px);
}

/* 검색 결과 없음 */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #8E8E93;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results p {
  font-size: 16px;
  font-weight: 500;
}

/* 추가 문의 카드 */
.faq-contact-card {
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  border: 2px solid #F2F2F7;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: center;
  flex-direction: column;
}

.contact-icon {
  font-size: 48px;
}

.contact-content h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1C1C1E;
  margin-bottom: 8px;
}

.contact-content p {
  font-size: 15px;
  color: #8E8E93;
  margin: 0;
}

.btn-contact {
  padding: 14px 32px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-contact:hover {
  background: #0051D5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.3);
}

/* 반응형 */
@media (max-width: 768px) {
  .faq-section {
    padding: 40px 0;
  }

  .faq-question {
    font-size: 15px;
    padding: 16px 20px;
  }

  .answer-content {
    padding: 0 20px 20px 20px;
  }

  .feedback-buttons {
    flex-direction: column;
  }

  .btn-feedback {
    justify-content: center;
  }

  .faq-contact-card {
    padding: 24px;
  }
}
```

---

#### 섹션 5: 필요서류 안내 (토스/네이버 스타일)

**요구사항**
```
기능:
  - 토스 스타일 탭 디자인
  - 개인/개인사업자/법인 구분
  - 체크리스트 형태
  - 서류 제출 방법 안내
  - 진행 단계 표시
```

**HTML 구조**
```html
<section class="documents-section">
  <div class="documents-container">
    <div class="section-header">
      <h2 class="section-title">필요서류 안내</h2>
      <p class="section-subtitle">신청 유형에 따라 필요한 서류를 미리 준비하세요</p>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="doc-tabs-wrapper">
      <div class="doc-tabs">
        <button class="doc-tab active" data-type="personal" onclick="showDocuments('personal')">
          <span class="tab-icon">👤</span>
          <span class="tab-label">개인</span>
        </button>
        <button class="doc-tab" data-type="business" onclick="showDocuments('business')">
          <span class="tab-icon">💼</span>
          <span class="tab-label">개인사업자</span>
        </button>
        <button class="doc-tab" data-type="corporate" onclick="showDocuments('corporate')">
          <span class="tab-icon">🏢</span>
          <span class="tab-label">법인사업자</span>
        </button>
      </div>
    </div>

    <!-- 서류 패널 -->
    <div class="doc-panels">
      <!-- 개인 -->
      <div id="doc-personal" class="doc-panel active">
        <div class="panel-header">
          <h3>개인 신청 시 필요서류</h3>
          <span class="required-count">총 5개 필요</span>
        </div>
        <ul class="doc-checklist">
          <li class="doc-check-item">
            <div class="check-icon">📄</div>
            <div class="check-content">
              <div class="check-title">신분증 사본</div>
              <div class="check-desc">주민등록증 또는 운전면허증</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">💳</div>
            <div class="check-content">
              <div class="check-title">재직증명서</div>
              <div class="check-desc">3개월 이내 발급본</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">💰</div>
            <div class="check-content">
              <div class="check-title">소득증빙서류</div>
              <div class="check-desc">원천징수 영수증 또는 급여명세서 3개월분</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">🏦</div>
            <div class="check-content">
              <div class="check-title">통장사본</div>
              <div class="check-desc">급여 입금 계좌</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">📋</div>
            <div class="check-content">
              <div class="check-title">주민등록등본</div>
              <div class="check-desc">3개월 이내 발급본</div>
            </div>
            <div class="check-required optional">선택</div>
          </li>
        </ul>
      </div>

      <!-- 개인사업자 -->
      <div id="doc-business" class="doc-panel">
        <div class="panel-header">
          <h3>개인사업자 신청 시 필요서류</h3>
          <span class="required-count">총 6개 필요</span>
        </div>
        <ul class="doc-checklist">
          <li class="doc-check-item">
            <div class="check-icon">📄</div>
            <div class="check-content">
              <div class="check-title">신분증 사본</div>
              <div class="check-desc">주민등록증 또는 운전면허증</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">🏢</div>
            <div class="check-content">
              <div class="check-title">사업자등록증 사본</div>
              <div class="check-desc">현재 운영 중인 사업자등록증</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">💰</div>
            <div class="check-content">
              <div class="check-title">소득금액증명원</div>
              <div class="check-desc">최근 1년분</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">📊</div>
            <div class="check-content">
              <div class="check-title">부가가치세 납부확인서</div>
              <div class="check-desc">최근 2기분</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">🏦</div>
            <div class="check-content">
              <div class="check-title">사업용 통장사본</div>
              <div class="check-desc">사업자 명의 계좌</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">📋</div>
            <div class="check-content">
              <div class="check-title">주민등록등본</div>
              <div class="check-desc">3개월 이내 발급본</div>
            </div>
            <div class="check-required optional">선택</div>
          </li>
        </ul>
      </div>

      <!-- 법인사업자 -->
      <div id="doc-corporate" class="doc-panel">
        <div class="panel-header">
          <h3>법인사업자 신청 시 필요서류</h3>
          <span class="required-count">총 7개 필요</span>
        </div>
        <ul class="doc-checklist">
          <li class="doc-check-item">
            <div class="check-icon">🏢</div>
            <div class="check-content">
              <div class="check-title">법인등기부등본</div>
              <div class="check-desc">3개월 이내 발급본</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">📄</div>
            <div class="check-content">
              <div class="check-title">사업자등록증 사본</div>
              <div class="check-desc">법인 사업자등록증</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">💰</div>
            <div class="check-content">
              <div class="check-title">법인 소득금액증명원</div>
              <div class="check-desc">최근 1년분</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">📊</div>
            <div class="check-content">
              <div class="check-title">재무제표</div>
              <div class="check-desc">최근 1년분 (대차대조표, 손익계산서)</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">🏦</div>
            <div class="check-content">
              <div class="check-title">법인 통장사본</div>
              <div class="check-desc">법인 명의 계좌</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">👤</div>
            <div class="check-content">
              <div class="check-title">대표이사 신분증 사본</div>
              <div class="check-desc">주민등록증 또는 운전면허증</div>
            </div>
            <div class="check-required">필수</div>
          </li>
          <li class="doc-check-item">
            <div class="check-icon">✍️</div>
            <div class="check-content">
              <div class="check-title">법인인감증명서</div>
              <div class="check-desc">3개월 이내 발급본</div>
            </div>
            <div class="check-required">필수</div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 제출 방법 안내 -->
    <div class="submit-methods">
      <h3>서류 제출 방법</h3>
      <div class="methods-grid">
        <div class="method-card">
          <div class="method-icon">📧</div>
          <div class="method-title">이메일</div>
          <div class="method-desc">docs@carmanager.com</div>
          <button class="btn-method-select">이메일 보내기</button>
        </div>
        <div class="method-card">
          <div class="method-icon">📠</div>
          <div class="method-title">팩스</div>
          <div class="method-desc">02-1234-5678</div>
          <button class="btn-method-select">팩스 보내기</button>
        </div>
        <div class="method-card recommended">
          <div class="recommend-badge">추천</div>
          <div class="method-icon">📱</div>
          <div class="method-title">앱 업로드</div>
          <div class="method-desc">가장 빠르고 안전해요</div>
          <button class="btn-method-select primary">앱에서 제출</button>
        </div>
      </div>
    </div>

    <!-- 안내사항 -->
    <div class="doc-notice-card">
      <div class="notice-icon">💡</div>
      <div class="notice-content">
        <h4>서류 제출 전 확인하세요</h4>
        <ul>
          <li>모든 서류는 <strong>3개월 이내 발급</strong>된 것이어야 해요</li>
          <li>서류 심사 후 <strong>추가 서류가 요청</strong>될 수 있어요</li>
          <li>개인정보는 <strong>안전하게 암호화</strong>되어 보관돼요</li>
          <li>서류 검토는 평균 <strong>1-2영업일</strong> 소요돼요</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

**JavaScript 구현**
```javascript
// car-detail.js

function showDocuments(type) {
  // 모든 탭 비활성화
  document.querySelectorAll('.doc-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.doc-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // 선택한 탭 활성화
  const selectedTab = document.querySelector(`.doc-tab[data-type="${type}"]`);
  selectedTab.classList.add('active');

  const selectedPanel = document.getElementById(`doc-${type}`);
  selectedPanel.classList.add('active');
}

// 페이지 로드 시 개인 탭 활성화
document.addEventListener('DOMContentLoaded', () => {
  showDocuments('personal');
});
```

**CSS 스타일**
```css
.documents-section {
  padding: 60px 0;
  background: #F8F9FA;
}

.documents-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 탭 */
.doc-tabs-wrapper {
  margin: 32px 0;
}

.doc-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: white;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid #F2F2F7;
}

.doc-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.doc-tab.active {
  background: #007AFF;
  color: white;
}

.tab-icon {
  font-size: 28px;
}

.tab-label {
  font-size: 14px;
  font-weight: 700;
  color: #8E8E93;
}

.doc-tab.active .tab-label {
  color: white;
}

/* 패널 */
.doc-panels {
  margin-bottom: 40px;
}

.doc-panel {
  display: none;
  background: white;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #F2F2F7;
}

.doc-panel.active {
  display: block;
  animation: fadeSlideIn 0.4s ease-out;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #F2F2F7;
}

.panel-header h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1C1C1E;
  margin: 0;
}

.required-count {
  font-size: 13px;
  font-weight: 600;
  color: #8E8E93;
  background: #F2F2F7;
  padding: 6px 12px;
  border-radius: 8px;
}

/* 체크리스트 */
.doc-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-check-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.doc-check-item:hover {
  background: #F2F2F7;
  transform: translateX(4px);
}

.check-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.check-content {
  flex: 1;
}

.check-title {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 4px;
}

.check-desc {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

.check-required {
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: #FF3B30;
  padding: 6px 12px;
  border-radius: 6px;
  flex-shrink: 0;
}

.check-required.optional {
  background: #8E8E93;
}

/* 제출 방법 */
.submit-methods {
  margin-bottom: 32px;
}

.submit-methods h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1C1C1E;
  margin-bottom: 20px;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.method-card {
  background: white;
  border: 2px solid #F2F2F7;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.method-card.recommended {
  border-color: #007AFF;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.1);
}

.method-card:hover {
  border-color: #E5E5EA;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.recommend-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #007AFF;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
}

.method-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.method-title {
  font-size: 16px;
  font-weight: 700;
  color: #1C1C1E;
  margin-bottom: 6px;
}

.method-desc {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 16px;
}

.btn-method-select {
  width: 100%;
  padding: 12px;
  background: #F2F2F7;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1C1C1E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-method-select:hover {
  background: #E5E5EA;
}

.btn-method-select.primary {
  background: #007AFF;
  color: white;
}

.btn-method-select.primary:hover {
  background: #0051D5;
}

/* 안내사항 */
.doc-notice-card {
  background: linear-gradient(135deg, #FFF9E6 0%, #FFF4D4 100%);
  border: 2px solid #FFEAA7;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
}

.notice-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.notice-content h4 {
  font-size: 16px;
  font-weight: 800;
  color: #1C1C1E;
  margin: 0 0 12px 0;
}

.notice-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-content li {
  font-size: 14px;
  color: #3C3C43;
  line-height: 1.6;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.notice-content li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #FF9500;
  font-weight: bold;
}

.notice-content strong {
  color: #FF9500;
  font-weight: 700;
}

/* 반응형 */
@media (max-width: 768px) {
  .documents-section {
    padding: 40px 0;
  }

  .doc-tabs {
    grid-template-columns: 1fr;
  }

  .doc-panel {
    padding: 24px;
  }

  .methods-grid {
    grid-template-columns: 1fr;
  }

  .doc-notice-card {
    flex-direction: column;
  }
}
```

---

#### 섹션 6: 견적만료 타이머 (토스/네이버 스타일)

**요구사항**
```
기능:
  - 페이지 상단 고정 (sticky)
  - 토스 스타일 디자인
  - 탭 진입 시점부터 7일 카운트다운
  - 실시간 업데이트 (초 단위)
  - 진행 바 표시
  - 만료 임박 시 경고 스타일
  - 저장 버튼
```

**HTML 구조**
```html
<div class="quote-expiry-banner" id="expiryBanner">
  <div class="expiry-container">
    <div class="expiry-main">
      <div class="expiry-left">
        <div class="expiry-icon-wrapper">
          <span class="expiry-icon">⏰</span>
        </div>
        <div class="expiry-info">
          <span class="expiry-label">견적 유효기간</span>
          <div class="expiry-timer" id="expiryTimer">
            <span class="timer-value">계산 중...</span>
          </div>
        </div>
      </div>

      <div class="expiry-right">
        <div class="expiry-meta">
          <span class="expiry-date-label">만료일</span>
          <span class="expiry-date-value" id="expiryDate">-</span>
        </div>
        <button class="btn-save-quote" onclick="saveQuote()">
          <span class="btn-icon">💾</span>
          <span>견적 저장</span>
        </button>
      </div>
    </div>

    <!-- 진행 바 -->
    <div class="expiry-progress">
      <div class="progress-bar" id="progressBar"></div>
    </div>
  </div>
</div>
```

**JavaScript 구현**
```javascript
// car-detail.js

let expiryTimestamp;
let entryTimestamp;
let timerInterval;
const EXPIRY_DAYS = 7;

function initializeQuoteExpiry() {
  const storageKey = `quote_entry_${getCarId()}`;
  let entryTime = localStorage.getItem(storageKey);

  if (!entryTime) {
    // 첫 진입: 현재 시간 저장
    entryTime = new Date().getTime();
    localStorage.setItem(storageKey, entryTime);
  }

  entryTimestamp = parseInt(entryTime);
  expiryTimestamp = entryTimestamp + (EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // 만료일 표시
  const expiryDate = new Date(expiryTimestamp);
  document.getElementById('expiryDate').textContent =
    expiryDate.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  // 타이머 시작
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = new Date().getTime();
  const remaining = expiryTimestamp - now;
  const totalDuration = expiryTimestamp - entryTimestamp;
  const elapsed = now - entryTimestamp;
  const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);

  // 진행 바 업데이트
  document.getElementById('progressBar').style.width = progressPercent + '%';

  if (remaining <= 0) {
    // 만료됨
    clearInterval(timerInterval);
    showExpired();
    return;
  }

  // 시간 계산
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  // 타이머 HTML 생성
  let timerHtml = '';
  if (days > 0) {
    timerHtml += `<span class="time-digit">${days}</span><span class="time-label">일</span> `;
  }
  timerHtml += `<span class="time-digit">${String(hours).padStart(2, '0')}</span><span class="time-label">:</span>`;
  timerHtml += `<span class="time-digit">${String(minutes).padStart(2, '0')}</span><span class="time-label">:</span>`;
  timerHtml += `<span class="time-digit">${String(seconds).padStart(2, '0')}</span>`;

  document.querySelector('.timer-value').innerHTML = timerHtml;

  // 24시간 미만일 때 경고
  const banner = document.getElementById('expiryBanner');
  if (remaining < 24 * 60 * 60 * 1000) {
    banner.classList.add('warning');
    banner.classList.remove('normal');
  } else if (remaining < 3 * 24 * 60 * 60 * 1000) {
    banner.classList.add('caution');
    banner.classList.remove('normal');
  } else {
    banner.classList.add('normal');
  }
}

function showExpired() {
  const banner = document.getElementById('expiryBanner');
  banner.classList.add('expired');
  banner.classList.remove('warning', 'caution', 'normal');

  document.querySelector('.timer-value').innerHTML =
    '<span class="expired-text">견적이 만료되었습니다</span>';

  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('progressBar').style.background = '#FF3B30';
}

function saveQuote() {
  console.log('견적 저장');

  // 견적 정보 수집
  const quoteData = {
    carName: document.getElementById('carName').textContent,
    price: document.getElementById('carPrice').textContent,
    timestamp: new Date().getTime(),
    expiryDate: document.getElementById('expiryDate').textContent
  };

  // LocalStorage에 저장
  localStorage.setItem(`saved_quote_${getCarId()}`, JSON.stringify(quoteData));

  // 사용자 피드백
  showSaveConfirmation();
}

function showSaveConfirmation() {
  // 토스트 알림
  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span class="toast-message">견적이 저장되었습니다</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getCarId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'default';
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', initializeQuoteExpiry);

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (timerInterval) clearInterval(timerInterval);
});
```

**CSS 스타일**
```css
.quote-expiry-banner {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  color: white;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.quote-expiry-banner.warning {
  background: linear-gradient(135deg, #FF3B30 0%, #D32029 100%);
  animation: pulseWarning 1.5s infinite;
}

.quote-expiry-banner.caution {
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
}

.quote-expiry-banner.expired {
  background: linear-gradient(135deg, #8E8E93 0%, #6B7280 100%);
}

@keyframes pulseWarning {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.95; transform: scale(1.005); }
}

.expiry-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px 12px;
}

.expiry-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.expiry-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expiry-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.expiry-icon {
  font-size: 28px;
}

.expiry-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.expiry-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
  letter-spacing: -0.2px;
}

.expiry-timer {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.timer-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.time-digit {
  font-size: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.9;
  margin: 0 2px;
}

.expired-text {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

/* 우측 */
.expiry-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.expiry-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.expiry-date-label {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expiry-date-value {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.95;
}

.btn-save-quote {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-quote:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 16px;
}

/* 진행 바 */
.expiry-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  transition: width 1s linear, background 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.quote-expiry-banner.warning .progress-bar {
  background: rgba(255, 255, 255, 0.9);
  animation: progressPulse 1s infinite;
}

@keyframes progressPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 저장 토스트 */
.save-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1C1C1E;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 10000;
}

.save-toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-icon {
  width: 24px;
  height: 24px;
  background: #34C759;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.toast-message {
  font-size: 15px;
  font-weight: 600;
}

/* 반응형 */
@media (max-width: 768px) {
  .expiry-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .expiry-left {
    width: 100%;
  }

  .expiry-right {
    width: 100%;
    justify-content: space-between;
  }

  .expiry-meta {
    align-items: flex-start;
  }

  .timer-value {
    font-size: 20px;
  }

  .time-digit {
    font-size: 24px;
  }

  .time-label {
    font-size: 16px;
  }

  .btn-save-quote {
    padding: 8px 16px;
    font-size: 13px;
  }

  .save-toast {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }
}

/* 작은 화면 */
@media (max-width: 480px) {
  .expiry-container {
    padding: 12px 16px 8px;
  }

  .expiry-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .expiry-icon {
    font-size: 24px;
  }

  .expiry-label {
    font-size: 12px;
  }

  .timer-value {
    font-size: 18px;
  }

  .time-digit {
    font-size: 20px;
  }

  .time-label {
    font-size: 14px;
  }
}
```

---

#### 전체 페이지 구조 (car-detail.html) - 토스/네이버 스타일

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>차량 상세 견적 - Car Manager</title>

  <!-- Pretendard 폰트 -->
  <link rel="stylesheet" as="style" crossorigin
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- 스타일시트 -->
  <link rel="stylesheet" href="css/car-detail.css">
</head>
<body>
  <!-- 견적만료 타이머 (고정 헤더) -->
  <div class="quote-expiry-banner">
    <div class="expiry-container">
      <div class="expiry-content">
        <span class="expiry-icon">⏰</span>
        <div class="expiry-text">
          <span class="expiry-label">견적 유효기간</span>
          <span class="expiry-timer" id="expiryTimer">계산 중...</span>
        </div>
      </div>
      <div class="expiry-date">
        만료일: <span id="expiryDate"></span>
      </div>
    </div>
  </div>

  <div class="page-container">
    <!-- 차량 기본 정보 헤더 (토스 스타일) -->
    <section class="car-hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="car-image-container">
          <img id="carImage" src="" alt="차량 이미지" class="car-main-image">
          <div class="image-badge">
            <span class="badge-icon">📸</span>
            <span>고화질 사진</span>
          </div>
        </div>

        <div class="car-info-card">
          <div class="brand-badge" id="brandBadge">현대</div>
          <h1 class="car-name" id="carName">그랜저 3.5 가솔린</h1>

          <div class="car-specs-grid">
            <div class="spec-item">
              <span class="spec-icon">🚗</span>
              <div>
                <div class="spec-label">등급</div>
                <div class="spec-value" id="carGrade">3.5 가솔린 터보</div>
              </div>
            </div>
            <div class="spec-item">
              <span class="spec-icon">📏</span>
              <div>
                <div class="spec-label">주행거리</div>
                <div class="spec-value" id="carMileage">신차</div>
              </div>
            </div>
            <div class="spec-item">
              <span class="spec-icon">📅</span>
              <div>
                <div class="spec-label">등록일</div>
                <div class="spec-value" id="carDate">2025.12</div>
              </div>
            </div>
          </div>

          <div class="price-section">
            <div class="price-main">
              <span class="price-label">월 렌탈료</span>
              <span class="price-value" id="carPrice">600,000원</span>
            </div>
            <div class="price-note">부가세 포함 금액입니다</div>
          </div>

          <div class="action-buttons">
            <button class="btn-primary" onclick="applyQuote()">
              <span class="btn-icon">✓</span>
              견적 신청하기
            </button>
            <button class="btn-secondary" onclick="addToFavorites()">
              <span class="btn-icon">♡</span>
              찜하기
            </button>
            <button class="btn-outline" onclick="shareQuote()">
              <span class="btn-icon">↗</span>
              공유
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 섹션 1: 렌탈료 추이 그래프 -->
    <section class="price-analysis-section">
      <!-- 이미 개선 완료된 섹션 1 내용 -->
    </section>

    <!-- 섹션 2: 캐피탈사 비교 -->
    <section class="capital-comparison-section">
      <!-- 개선된 섹션 2 내용 -->
    </section>

    <!-- 섹션 3: 캐피탈 로고 슬라이드 -->
    <section class="capital-partners-section">
      <!-- 개선된 섹션 3 내용 -->
    </section>

    <!-- 섹션 4: QNA -->
    <section class="faq-section">
      <!-- 개선된 섹션 4 내용 -->
    </section>

    <!-- 섹션 5: 필요서류 안내 -->
    <section class="documents-section">
      <!-- 개선된 섹션 5 내용 -->
    </section>

    <!-- CTA 하단 섹션 -->
    <section class="bottom-cta">
      <div class="cta-card">
        <div class="cta-content">
          <h3>지금 바로 상담받아보세요</h3>
          <p>전문 상담사가 최적의 렌탈 조건을 안내해드립니다</p>
        </div>
        <div class="cta-actions">
          <button class="btn-cta-primary" onclick="applyQuote()">
            견적 신청하기
          </button>
          <button class="btn-cta-secondary" onclick="window.print()">
            견적서 저장
          </button>
        </div>
      </div>
    </section>

    <!-- 푸터 -->
    <footer class="page-footer">
      <p class="footer-text">본 견적은 참고용이며, 실제 조건은 심사 후 달라질 수 있습니다.</p>
      <p class="footer-copyright">© 2025 Car Manager. All rights reserved.</p>
    </footer>
  </div>

  <script src="js/car-detail.js"></script>
</body>
</html>
```

**전체 페이지 CSS (기본 레이아웃)**
```css
/* 기본 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo",
               "Noto Sans KR", sans-serif;
}

body {
  background: #F8F9FA;
  color: #1C1C1E;
  line-height: 1.6;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 차량 히어로 섹션 */
.car-hero-section {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0 40px;
  margin-bottom: 32px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,...') repeat;
  opacity: 0.1;
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.car-image-container {
  position: relative;
}

.car-main-image {
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.6s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.image-badge {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.badge-icon {
  font-size: 16px;
}

.car-info-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.6s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-badge {
  display: inline-block;
  background: #E8F3FF;
  color: #007AFF;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.car-name {
  font-size: 32px;
  font-weight: 800;
  color: #1C1C1E;
  margin-bottom: 24px;
  letter-spacing: -1px;
}

.car-specs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 16px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spec-icon {
  font-size: 24px;
}

.spec-label {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
  margin-bottom: 2px;
}

.spec-value {
  font-size: 15px;
  color: #1C1C1E;
  font-weight: 600;
}

.price-section {
  padding: 24px 0;
  border-top: 1px solid #F2F2F7;
  border-bottom: 1px solid #F2F2F7;
  margin-bottom: 24px;
}

.price-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.price-label {
  font-size: 14px;
  color: #8E8E93;
  font-weight: 500;
}

.price-value {
  font-size: 36px;
  font-weight: 800;
  color: #007AFF;
  letter-spacing: -1px;
}

.price-note {
  font-size: 13px;
  color: #8E8E93;
}

.action-buttons {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:hover {
  background: #0051D5;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
}

.btn-secondary {
  background: #F2F2F7;
  color: #1C1C1E;
}

.btn-secondary:hover {
  background: #E5E5EA;
}

.btn-outline {
  background: white;
  color: #007AFF;
  border: 2px solid #007AFF;
}

.btn-outline:hover {
  background: #E8F3FF;
}

.btn-icon {
  font-size: 16px;
}

/* 하단 CTA */
.bottom-cta {
  margin: 60px 0;
}

.cta-card {
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  color: white;
}

.cta-content h3 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
}

.cta-content p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-cta-primary,
.btn-cta-secondary {
  padding: 18px 40px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cta-primary {
  background: white;
  color: #007AFF;
}

.btn-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

.btn-cta-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 푸터 */
.page-footer {
  text-align: center;
  padding: 40px 20px;
  border-top: 1px solid #F2F2F7;
  margin-top: 60px;
}

.footer-text {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 8px;
}

.footer-copyright {
  font-size: 12px;
  color: #C7C7CC;
}

/* 반응형 */
@media (max-width: 968px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .car-name {
    font-size: 26px;
  }

  .price-value {
    font-size: 28px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
  }

  .btn-cta-primary,
  .btn-cta-secondary {
    width: 100%;
  }
}
```

---

#### 메인 페이지 연동 (index.html 수정)

```javascript
// script.js에 추가

function openCarDetail(carId) {
  // 새 탭에서 상세 페이지 열기
  window.open(`car-detail.html?id=${carId}`, '_blank');
}

// 차량 카드 클릭 이벤트
document.querySelectorAll('.car-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const carId = e.currentTarget.dataset.carId;
    openCarDetail(carId);
  });
});
```

---

### 3. 즐겨찾기 기능

#### 요구사항
```
기능:
  - 즐겨찾기 추가/제거
  - LocalStorage에 저장
  - 헤더에 즐겨찾기 카운트 표시
  - 즐겨찾기 목록 보기 페이지/탭
  - 하트 아이콘 토글 애니메이션
```

#### 데이터 구조
```javascript
// LocalStorage에 저장할 구조
{
  "favorites": [
    "uuid-1234-5678-abcd",  // 차량 ID (UUID)
    "uuid-9876-5432-efgh"
  ]
}
```

#### 파일 수정
```
favorites.js (신규 파일):
  - addToFavorites(carId)
  - removeFromFavorites(carId)
  - getFavorites()
  - isFavorite(carId)

index.html:
  - 헤더에 즐겨찾기 카운트 뱃지 추가
  - 각 차량 카드에 하트 버튼 추가

style.css:
  - 하트 아이콘 애니메이션
  - 즐겨찾기 뱃지 스타일
```

---

### 4. 정렬 기능

#### 요구사항
```
정렬 옵션:
  - 가격 낮은순
  - 가격 높은순
  - 최신순 (등록일 기준)
  - 브랜드명순 (ㄱㄴㄷ)

UI:
  - 드롭다운 선택 박스
  - 현재 정렬 상태 표시
```

#### 구현
```javascript
// script.js에 추가

const sortOptions = {
    priceLow: (a, b) => a.price - b.price,
    priceHigh: (a, b) => b.price - a.price,
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    brand: (a, b) => a.brand.localeCompare(b.brand)
};

function sortCars(cars, sortBy) {
    return [...cars].sort(sortOptions[sortBy]);
}
```

---

### 5. 페이지네이션

#### 요구사항
```
기능:
  - 페이지당 12개 차량 표시
  - 이전/다음 버튼
  - 페이지 번호 클릭
  - 현재 페이지 하이라이트
  - "1 / 5 페이지" 표시
```

#### 구현 가이드
```javascript
const ITEMS_PER_PAGE = 12;
let currentPage = 1;

function paginateCars(cars, page) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return cars.slice(start, end);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    // 페이지 버튼 생성...
}
```

---

### 6. 다크모드

#### 요구사항
```
기능:
  - 헤더에 다크모드 토글 버튼 (🌙/☀️)
  - LocalStorage에 설정 저장
  - 부드러운 전환 애니메이션
  - 모든 페이지에 적용
```

#### CSS 변수 구조
```css
:root {
    /* 라이트 모드 */
    --bg-primary: #FFFFFF;
    --bg-secondary: #F1F5F9;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --border-color: #E2E8F0;
}

[data-theme="dark"] {
    /* 다크 모드 */
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --text-primary: #F1F5F9;
    --text-secondary: #94A3B8;
    --border-color: #334155;
}

* {
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

---

### 7. 차량 비교 기능

#### 요구사항
```
기능:
  - 최대 3개 차량 선택
  - 비교 모드 활성화
  - 나란히 비교 테이블 표시
  - 가격/스펙/주행거리 비교
  - 차이점 하이라이트
```

#### UI 구조
```html
<div class="compare-bar">
  <div class="compare-items">
    <!-- 선택된 차량 미리보기 -->
  </div>
  <button class="btn-compare">비교하기 (2/3)</button>
</div>

<div id="compareModal" class="modal">
  <table class="compare-table">
    <thead>
      <tr>
        <th>항목</th>
        <th>차량 1</th>
        <th>차량 2</th>
        <th>차량 3</th>
      </tr>
    </thead>
    <tbody>
      <!-- 비교 데이터 -->
    </tbody>
  </table>
</div>
```

---

### 8. 반응형 개선

#### 개선사항
```
모바일 (< 768px):
  - 필터 패널을 하단 시트로 변경
  - 카드 1열 레이아웃
  - 터치 제스처 지원 (스와이프로 상세보기)

태블릿 (768px ~ 1024px):
  - 카드 2열 레이아웃
  - 사이드 필터 패널

PC (> 1024px):
  - 카드 3-4열 레이아웃
  - 고정 필터 패널
```

---

## 📦 필요한 라이브러리

```html
<!-- 가격 슬라이더 -->
<link href="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js"></script>

<!-- 애니메이션 (선택사항) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
```

---

## 🎨 디자인 가이드

### 색상 팔레트
```css
/* 메인 컬러 */
--primary: #3B82F6;
--primary-dark: #2563EB;
--secondary: #10B981;

/* 상태 컬러 */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* 브랜드 컬러 */
--hyundai: #0369A1;
--kia: #991B1B;
--genesis: #6B21A8;
--benz: #1F2937;
--bmw: #1E40AF;
```

---

## 📄 새로 생성할 파일 목록

```
frontend/
├── modal.js              (차량 상세 모달)
├── modal.css             (모달 스타일)
├── favorites.js          (즐겨찾기 관리)
├── compare.js            (비교 기능)
├── pagination.js         (페이지네이션)
├── darkmode.js           (다크모드)
└── filter-advanced.js    (고급 필터)
```

---

# B. 특정 기능 추가 개발

## 📌 고급 기능 목록

### 1. Excel/CSV 내보내기

#### 요구사항
```
기능:
  - 현재 필터링된 차량 목록을 Excel로 다운로드
  - CSV 형식 지원
  - 컬럼: 브랜드, 모델명, 스펙, 가격, 주행거리, 등록일
  - 파일명: cars_export_2025-12-27.xlsx
```

#### 구현 가이드
```javascript
// export.js

// SheetJS 라이브러리 사용 (CDN)
// <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

function exportToExcel(cars) {
    const data = cars.map(car => ({
        '브랜드': getBrandName(car.brand),
        '모델명': car.name,
        '스펙': car.grade,
        '월 렌탈료': car.price,
        '주행거리': car.mileage,
        '등록일': car.createdAt || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "차량목록");

    const filename = `cars_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// 사용법
document.getElementById('btnExport').addEventListener('click', () => {
    const currentCars = getFilteredCars();
    exportToExcel(currentCars);
    Toast.success('Excel 파일이 다운로드되었습니다!');
});
```

---

### 2. 일괄 등록 (CSV 업로드)

#### 요구사항
```
기능:
  - CSV 파일 업로드
  - 파일 검증 (형식, 필수 컬럼)
  - 미리보기 테이블
  - 일괄 등록 실행
  - 진행률 표시
  - 에러 로그 표시
```

#### CSV 형식
```csv
brand,name,grade,price,mileage,image
hyundai,그랜저,2.5 가솔린,600000,신차,https://example.com/image.jpg
kia,K8,3.5 터보,800000,신차,https://example.com/image2.jpg
```

#### 구현 파일
```
bulk-upload.html (새 페이지 또는 모달)
bulk-upload.js
  - parseCSV(file)
  - validateCSV(data)
  - previewCSV(data)
  - bulkInsert(data)
```

---

### 3. 통계 및 차트

#### 요구사항
```
페이지: statistics.html (새 페이지)

차트 종류:
  1. 브랜드별 차량 수 (파이 차트)
  2. 가격대별 분포 (막대 그래프)
  3. 월별 등록 추이 (라인 차트)
  4. 평균 렌탈료 추이 (라인 차트)

기능:
  - 기간 필터 (최근 1개월, 3개월, 6개월, 전체)
  - 차트 다운로드 (이미지)
  - 데이터 테이블 보기
```

#### 라이브러리
```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### 구현 예시
```javascript
// statistics.js

function renderBrandChart(cars) {
    const brandCount = {};
    cars.forEach(car => {
        brandCount[car.brand] = (brandCount[car.brand] || 0) + 1;
    });

    const ctx = document.getElementById('brandChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(brandCount).map(b => getBrandName(b)),
            datasets: [{
                data: Object.values(brandCount),
                backgroundColor: [
                    '#0369A1', '#991B1B', '#6B21A8', '#1F2937', '#1E40AF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '브랜드별 차량 분포'
                }
            }
        }
    });
}
```

---

### 4. 알림 시스템

#### 요구사항
```
기능:
  - 새 차량 등록 시 사용자에게 알림
  - 가격 변동 알림
  - 즐겨찾기한 차량 업데이트 알림
  - 브라우저 푸시 알림 (선택사항)
  - 알림 내역 페이지
```

#### 데이터 구조
```javascript
// LocalStorage: notifications
{
  "notifications": [
    {
      "id": "uuid-...",
      "type": "new_car",
      "title": "신규 차량 등록",
      "message": "[현대] 그랜저가 등록되었습니다.",
      "carId": "uuid-car-...",
      "read": false,
      "createdAt": "2025-12-27T10:30:00Z"
    }
  ]
}
```

---

### 5. 검색 자동완성

#### 요구사항
```
기능:
  - 검색창에 입력 시 자동완성 드롭다운
  - 브랜드명, 모델명 검색
  - 최근 검색어 저장
  - 인기 검색어 표시
  - 키보드 내비게이션 (↑↓ 화살표)
```

#### 구현
```javascript
// autocomplete.js

let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

function autocomplete(input) {
    const db = getDB();
    const query = input.toLowerCase();

    // 브랜드 매칭
    const brandMatches = Object.keys(brandNames)
        .filter(b => brandNames[b].toLowerCase().includes(query))
        .map(b => ({ type: 'brand', value: brandNames[b] }));

    // 모델명 매칭
    const modelMatches = db.cars
        .filter(car => car.name.toLowerCase().includes(query))
        .map(car => ({ type: 'model', value: car.name }))
        .slice(0, 5);

    return [...brandMatches, ...modelMatches];
}
```

---

### 6. 리뷰/평점 시스템

#### 요구사항
```
기능:
  - 각 차량에 리뷰 작성 (익명 또는 닉네임)
  - 별점 (1~5)
  - 리뷰 목록 표시
  - 평균 평점 계산
  - 리뷰 필터 (최신순, 평점높은순, 평점낮은순)
```

#### 데이터 구조
```javascript
{
  "reviews": [
    {
      "id": "uuid-...",
      "carId": "uuid-car-...",
      "author": "김**",
      "rating": 5,
      "comment": "정말 좋은 차량입니다!",
      "createdAt": "2025-12-27T10:00:00Z"
    }
  ]
}
```

---

### 7. 예약/문의 시스템

#### 요구사항
```
기능:
  - 차량 예약 폼
  - 입력 정보: 이름, 전화번호, 이메일, 희망 날짜, 메시지
  - 예약 목록 관리 (어드민)
  - 예약 상태: 대기중, 확인완료, 취소
  - 이메일 알림 (선택사항)
```

#### 파일 구조
```
reservation.html (새 페이지)
reservation.js
reservation-admin.html (어드민 페이지)
reservation-admin.js
```

---

# C. 백엔드 서버 구축

## 📌 백엔드 아키텍처 설계

### 기술 스택 옵션

#### 옵션 1: Node.js + Express + MongoDB (권장)
```
장점:
  - JavaScript 통일 (프론트와 동일 언어)
  - 빠른 개발
  - 풍부한 생태계
  - 무료 호스팅 옵션 (Vercel, Render)

단점:
  - 대규모 트래픽 처리 제한
```

#### 옵션 2: Firebase (가장 빠름)
```
장점:
  - 백엔드 코딩 최소화
  - 실시간 동기화
  - 인증 내장
  - 무료 플랜 제공

단점:
  - 벤더 종속
  - 복잡한 쿼리 제한
```

#### 옵션 3: Python + FastAPI + PostgreSQL
```
장점:
  - 고성능
  - 타입 안전성
  - SQL 강력함

단점:
  - 언어 분리
  - 배포 복잡도 증가
```

---

## 🏗️ 백엔드 API 설계 (RESTful)

### 엔드포인트 목록

```
인증 (Authentication)
├── POST   /api/auth/login          # 로그인
├── POST   /api/auth/logout         # 로그아웃
├── POST   /api/auth/refresh        # 토큰 갱신
└── GET    /api/auth/me             # 현재 사용자 정보

차량 (Cars)
├── GET    /api/cars                # 차량 목록 (필터링, 정렬, 페이지네이션)
├── GET    /api/cars/:id            # 차량 상세
├── POST   /api/cars                # 차량 등록 (관리자)
├── PUT    /api/cars/:id            # 차량 수정 (관리자)
├── DELETE /api/cars/:id            # 차량 삭제 (관리자)
└── POST   /api/cars/bulk           # 일괄 등록 (관리자)

브랜드 (Brands)
├── GET    /api/brands              # 브랜드 목록
├── POST   /api/brands              # 브랜드 추가 (관리자)
└── PUT    /api/brands/:id          # 브랜드 수정 (관리자)

이미지 (Images)
├── POST   /api/images/upload       # 이미지 업로드
└── GET    /api/images/:filename    # 이미지 조회

즐겨찾기 (Favorites)
├── GET    /api/favorites           # 내 즐겨찾기 목록
├── POST   /api/favorites/:carId    # 즐겨찾기 추가
└── DELETE /api/favorites/:carId    # 즐겨찾기 제거

리뷰 (Reviews)
├── GET    /api/reviews             # 리뷰 목록 (차량별)
├── POST   /api/reviews             # 리뷰 작성
├── PUT    /api/reviews/:id         # 리뷰 수정
└── DELETE /api/reviews/:id         # 리뷰 삭제

예약 (Reservations)
├── GET    /api/reservations        # 예약 목록 (관리자)
├── GET    /api/reservations/:id    # 예약 상세
├── POST   /api/reservations        # 예약 생성
├── PUT    /api/reservations/:id    # 예약 상태 변경 (관리자)
└── DELETE /api/reservations/:id    # 예약 취소

통계 (Statistics) - 관리자 전용
├── GET    /api/stats/overview      # 전체 통계
├── GET    /api/stats/brands        # 브랜드별 통계
└── GET    /api/stats/revenue       # 매출 통계
```

---

## 📊 데이터베이스 스키마 (MongoDB)

### 1. Users 컬렉션
```javascript
{
  _id: ObjectId,
  username: String,      // 고유
  email: String,         // 고유
  password: String,      // bcrypt 해싱
  role: String,          // 'admin' | 'user'
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Cars 컬렉션
```javascript
{
  _id: ObjectId,
  brand: String,         // 'hyundai', 'kia', 'genesis', 'benz', 'bmw'
  name: String,          // 모델명
  grade: String,         // 스펙/등급
  price: Number,         // 월 렌탈료
  mileage: String,       // 주행거리
  image: String,         // 이미지 URL 또는 파일명
  status: String,        // 'available' | 'reserved' | 'rented'
  views: Number,         // 조회수
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId    // User ID (관리자)
}
```

### 3. Brands 컬렉션
```javascript
{
  _id: ObjectId,
  code: String,          // 'hyundai', 'kia', ...
  name: String,          // '현대', '기아', ...
  logo: String,          // 로고 URL
  order: Number          // 정렬 순서
}
```

### 4. Favorites 컬렉션
```javascript
{
  _id: ObjectId,
  userId: ObjectId,      // User ID
  carId: ObjectId,       // Car ID
  createdAt: Date
}

// 복합 인덱스: userId + carId (고유)
```

### 5. Reviews 컬렉션
```javascript
{
  _id: ObjectId,
  carId: ObjectId,       // Car ID
  userId: ObjectId,      // User ID (선택사항, 익명 가능)
  author: String,        // 닉네임
  rating: Number,        // 1~5
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Reservations 컬렉션
```javascript
{
  _id: ObjectId,
  carId: ObjectId,       // Car ID
  name: String,
  phone: String,
  email: String,
  preferredDate: Date,
  message: String,
  status: String,        // 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 인증/보안 설계

### JWT 기반 인증
```javascript
// 로그인 시 토큰 발급
POST /api/auth/login
Request:
{
  "username": "admin",
  "password": "admin1234"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "admin"
  }
}

// 모든 요청에 포함
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 보안 체크리스트
```
✅ 비밀번호 bcrypt 해싱 (salt rounds: 10)
✅ JWT 토큰 만료 시간 (accessToken: 15분, refreshToken: 7일)
✅ CORS 설정 (허용된 도메인만)
✅ Rate Limiting (API 호출 제한)
✅ Input Validation (Joi 또는 Zod)
✅ SQL Injection 방지 (MongoDB는 기본 방어)
✅ XSS 방지 (입력 sanitization)
✅ HTTPS 필수 (프로덕션)
```

---

## 📁 백엔드 프로젝트 구조

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # DB 연결 설정
│   │   ├── jwt.js               # JWT 설정
│   │   └── upload.js            # 파일 업로드 설정
│   │
│   ├── models/
│   │   ├── User.js              # User 모델
│   │   ├── Car.js               # Car 모델
│   │   ├── Brand.js             # Brand 모델
│   │   ├── Favorite.js          # Favorite 모델
│   │   ├── Review.js            # Review 모델
│   │   └── Reservation.js       # Reservation 모델
│   │
│   ├── controllers/
│   │   ├── authController.js    # 인증 로직
│   │   ├── carController.js     # 차량 CRUD
│   │   ├── brandController.js
│   │   ├── favoriteController.js
│   │   ├── reviewController.js
│   │   ├── reservationController.js
│   │   └── statsController.js
│   │
│   ├── middlewares/
│   │   ├── auth.js              # 인증 미들웨어
│   │   ├── adminOnly.js         # 관리자 전용
│   │   ├── validate.js          # 입력 검증
│   │   ├── errorHandler.js      # 에러 핸들링
│   │   └── rateLimiter.js       # Rate limiting
│   │
│   ├── routes/
│   │   ├── auth.js              # /api/auth
│   │   ├── cars.js              # /api/cars
│   │   ├── brands.js            # /api/brands
│   │   ├── favorites.js         # /api/favorites
│   │   ├── reviews.js           # /api/reviews
│   │   ├── reservations.js      # /api/reservations
│   │   └── stats.js             # /api/stats
│   │
│   ├── utils/
│   │   ├── logger.js            # 로깅
│   │   ├── response.js          # 표준 응답 포맷
│   │   └── validators.js        # 커스텀 검증
│   │
│   ├── app.js                   # Express 앱 설정
│   └── server.js                # 서버 시작
│
├── uploads/                     # 업로드된 이미지 저장
├── .env                         # 환경 변수
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔧 환경 변수 (.env)

```bash
# 서버 설정
NODE_ENV=development
PORT=5000

# 데이터베이스
MONGODB_URI=mongodb://localhost:27017/car-manager
# 또는 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-manager

# JWT 시크릿
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500

# 파일 업로드
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads

# 이메일 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🚀 배포 전략

### 1. 무료 호스팅 옵션

#### 프론트엔드
```
옵션 A: Vercel (권장)
  - 자동 HTTPS
  - GitHub 연동
  - 무제한 대역폭
  - 배포: vercel.com에서 Import Project

옵션 B: Netlify
  - 유사한 기능
  - 폼 처리 내장
  - 배포: netlify.com에서 Import

옵션 C: GitHub Pages
  - 정적 사이트만
  - 무료
  - 배포: Settings → Pages
```

#### 백엔드
```
옵션 A: Render (권장)
  - 무료 플랜: 750시간/월
  - 자동 HTTPS
  - MongoDB 연동 쉬움
  - 배포: render.com에서 New Web Service

옵션 B: Railway
  - $5 무료 크레딧/월
  - 간단한 배포
  - 배포: railway.app

옵션 C: Fly.io
  - 무료 플랜 제공
  - 글로벌 배포
```

#### 데이터베이스
```
MongoDB Atlas (권장)
  - 512MB 무료
  - 자동 백업
  - 회원가입: mongodb.com/cloud/atlas
```

---

## 📝 API 구현 예시 (Node.js + Express)

### server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN.split(',') }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 요청 제한
});
app.use('/api/', limiter);

// 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/stats', require('./routes/stats'));

// 정적 파일 (이미지)
app.use('/uploads', express.static('uploads'));

// 에러 핸들러
app.use(require('./middlewares/errorHandler'));

// DB 연결 및 서버 시작
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 서버 시작: http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
  });
```

### routes/cars.js
```javascript
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const upload = require('../config/upload');

// 공개 엔드포인트
router.get('/', carController.getCars);          // 목록
router.get('/:id', carController.getCarById);    // 상세

// 관리자 전용
router.post('/', auth, adminOnly, upload.single('image'), carController.createCar);
router.put('/:id', auth, adminOnly, carController.updateCar);
router.delete('/:id', auth, adminOnly, carController.deleteCar);
router.post('/bulk', auth, adminOnly, carController.bulkCreate);

module.exports = router;
```

### controllers/carController.js
```javascript
const Car = require('../models/Car');

exports.getCars = async (req, res, next) => {
  try {
    const {
      brand,        // 필터: 브랜드
      minPrice,     // 필터: 최소 가격
      maxPrice,     // 필터: 최대 가격
      mileage,      // 필터: 주행거리
      sortBy,       // 정렬: 'price_low', 'price_high', 'newest'
      page = 1,     // 페이지
      limit = 12    // 페이지당 아이템 수
    } = req.query;

    // 필터 구성
    const filter = {};
    if (brand) filter.brand = { $in: brand.split(',') };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (mileage) filter.mileage = mileage;

    // 정렬 구성
    const sortOptions = {
      price_low: { price: 1 },
      price_high: { price: -1 },
      newest: { createdAt: -1 }
    };
    const sort = sortOptions[sortBy] || { createdAt: -1 };

    // 쿼리 실행
    const cars = await Car.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Car.countDocuments(filter);

    res.json({
      success: true,
      data: cars,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: '차량을 찾을 수 없습니다.'
      });
    }

    // 조회수 증가
    car.views = (car.views || 0) + 1;
    await car.save();

    res.json({
      success: true,
      data: car
    });
  } catch (error) {
    next(error);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const { brand, name, grade, price, mileage } = req.body;

    const car = new Car({
      brand,
      name,
      grade,
      price: Number(price),
      mileage,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdBy: req.user.id  // 인증된 사용자 ID
    });

    await car.save();

    res.status(201).json({
      success: true,
      data: car,
      message: '차량이 등록되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

// updateCar, deleteCar, bulkCreate 구현...
```

---

# D. 통합 및 최종 개선

## 📌 통합 작업 개요

백엔드 API와 프론트엔드를 연결하고 최종 품질 검증

---

## 🔄 프론트엔드 → 백엔드 전환

### 1. API 클라이언트 작성

#### api.js (신규 파일)
```javascript
// API 기본 설정
const API_BASE_URL = 'http://localhost:5000/api';
// 프로덕션: const API_BASE_URL = 'https://your-backend.render.com/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  // 헤더 설정
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // GET 요청
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // POST 요청
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // PUT 요청
  async put(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // DELETE 요청
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // 파일 업로드
  async uploadFile(endpoint, file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    return this.handleResponse(response);
  }

  // 응답 처리
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      // 토큰 만료
      if (response.status === 401) {
        // 리프레시 토큰으로 재시도
        await this.refreshToken();
        // 원래 요청 재시도 로직...
      }

      throw new Error(data.message || '요청 실패');
    }

    return data;
  }

  // 토큰 갱신
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    // 갱신 로직...
  }

  // 로그인
  async login(username, password) {
    const data = await this.post('/auth/login', { username, password });

    this.token = data.accessToken;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data;
  }

  // 로그아웃
  logout() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// 전역 인스턴스
const api = new ApiClient();
window.api = api;
```

### 2. LocalStorage → API 마이그레이션

#### 기존 코드 변경
```javascript
// ❌ 변경 전 (LocalStorage)
function getDB() {
  const local = localStorage.getItem('carDB');
  return local ? JSON.parse(local) : { cars: [] };
}

function getCars() {
  const db = getDB();
  return db.cars;
}

// ✅ 변경 후 (API)
async function getCars(filters = {}) {
  try {
    const response = await api.get('/cars', filters);
    return response.data;
  } catch (error) {
    Toast.error('차량 목록을 불러오는데 실패했습니다.');
    console.error(error);
    return [];
  }
}

// 사용 예시
async function renderCarList() {
  const cars = await getCars({
    brand: 'hyundai',
    minPrice: 500000,
    maxPrice: 1000000,
    page: 1,
    limit: 12
  });

  // 렌더링 로직...
}
```

---

## ✅ 최종 품질 검증 체크리스트

### 기능 테스트
```
✅ 로그인/로그아웃
✅ 차량 등록 (이미지 포함)
✅ 차량 목록 조회
✅ 차량 수정
✅ 차량 삭제
✅ 필터링 (브랜드, 가격, 주행거리)
✅ 정렬 (가격, 최신순)
✅ 검색 기능
✅ 페이지네이션
✅ 즐겨찾기 추가/제거
✅ 차량 상세 모달
✅ 리뷰 작성/조회
✅ 예약 신청
✅ 통계 대시보드 (관리자)
✅ Excel 내보내기
✅ CSV 일괄 등록
```

### 보안 테스트
```
✅ SQL Injection 방어
✅ XSS 방어
✅ CSRF 방어
✅ 비밀번호 해싱 검증
✅ JWT 토큰 검증
✅ 권한 체크 (관리자 전용 API)
✅ Rate Limiting 동작 확인
✅ HTTPS 적용 (프로덕션)
```

### 성능 테스트
```
✅ 페이지 로드 시간 < 2초
✅ API 응답 시간 < 500ms
✅ 이미지 최적화 (WebP, lazy loading)
✅ 번들 크기 최적화
✅ 캐싱 전략 (Service Worker)
```

### 브라우저 호환성
```
✅ Chrome (최신)
✅ Firefox (최신)
✅ Safari (최신)
✅ Edge (최신)
✅ 모바일 Safari (iOS)
✅ 모바일 Chrome (Android)
```

### 반응형 테스트
```
✅ Desktop (1920x1080)
✅ Laptop (1366x768)
✅ Tablet (768x1024)
✅ Mobile (375x667)
✅ Mobile (320x568) - 최소 지원
```

---

## 🚀 배포 가이드

### 1단계: 프론트엔드 배포 (Vercel)

```bash
# 1. GitHub에 코드 푸시
git add .
git commit -m "Complete car manager system"
git push origin main

# 2. Vercel 배포
# vercel.com 접속
# → New Project
# → Import Git Repository
# → 프로젝트 선택
# → Deploy 클릭

# 3. 환경 변수 설정
# Settings → Environment Variables
# → VITE_API_URL = https://your-backend.render.com
```

### 2단계: 백엔드 배포 (Render)

```bash
# 1. GitHub에 백엔드 코드 푸시
cd backend
git init
git add .
git commit -m "Backend setup"
git push origin main

# 2. Render 배포
# render.com 접속
# → New → Web Service
# → Connect Repository
# → 설정:
#    - Name: car-manager-api
#    - Environment: Node
#    - Build Command: npm install
#    - Start Command: npm start

# 3. 환경 변수 설정 (.env 내용 복사)
```

### 3단계: MongoDB Atlas 설정

```bash
# 1. mongodb.com/cloud/atlas 접속
# 2. Create Free Cluster
# 3. Database Access → Add New User
# 4. Network Access → Add IP (0.0.0.0/0 - 모든 IP 허용)
# 5. Connect → Connect your application
# 6. Connection String 복사
# 7. Render 환경 변수에 MONGODB_URI 추가
```

---

## 📊 최종 프로젝트 구조

```
car-manager/
├── frontend/                    # 프론트엔드
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.html                 # 메인 페이지
│   │   │   ├── admin-login.html           # 로그인
│   │   │   ├── admin.html                 # 차량 등록
│   │   │   ├── admin-list.html            # 차량 목록
│   │   │   ├── admin-edit.html            # 차량 수정
│   │   │   ├── statistics.html            # 통계
│   │   │   └── reservations.html          # 예약 관리
│   │   │
│   │   ├── css/
│   │   │   ├── style.css                  # 메인 스타일
│   │   │   ├── admin.css                  # 어드민 스타일
│   │   │   ├── modal.css                  # 모달 스타일
│   │   │   └── darkmode.css               # 다크모드
│   │   │
│   │   ├── js/
│   │   │   ├── api.js                     # API 클라이언트
│   │   │   ├── auth.js                    # 인증
│   │   │   ├── script.js                  # 메인 로직
│   │   │   ├── admin.js                   # 차량 등록
│   │   │   ├── admin-list.js              # 차량 목록
│   │   │   ├── admin-edit.js              # 차량 수정
│   │   │   ├── modal.js                   # 모달
│   │   │   ├── favorites.js               # 즐겨찾기
│   │   │   ├── filter.js                  # 필터링
│   │   │   ├── pagination.js              # 페이지네이션
│   │   │   ├── compare.js                 # 비교
│   │   │   ├── darkmode.js                # 다크모드
│   │   │   ├── toast.js                   # 토스트
│   │   │   ├── validation.js              # 검증
│   │   │   └── utils.js                   # 유틸리티
│   │   │
│   │   └── assets/
│   │       └── images/
│   │
│   ├── vercel.json
│   └── package.json
│
├── backend/                     # 백엔드
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── upload.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Car.js
│   │   │   ├── Brand.js
│   │   │   ├── Favorite.js
│   │   │   ├── Review.js
│   │   │   └── Reservation.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── carController.js
│   │   │   ├── brandController.js
│   │   │   ├── favoriteController.js
│   │   │   ├── reviewController.js
│   │   │   ├── reservationController.js
│   │   │   └── statsController.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── adminOnly.js
│   │   │   ├── validate.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── cars.js
│   │   │   ├── brands.js
│   │   │   ├── favorites.js
│   │   │   ├── reviews.js
│   │   │   ├── reservations.js
│   │   │   └── stats.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── response.js
│   │   │   └── validators.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── docs/                        # 문서
│   ├── DESIGN-SPEC.md          # 이 파일
│   ├── README-ADMIN.md         # 어드민 가이드
│   ├── API-DOCS.md             # API 문서
│   └── DEPLOYMENT.md           # 배포 가이드
│
└── README.md                    # 프로젝트 메인 README
```

---

## 📚 추가 리소스

### 학습 자료
```
Frontend:
  - MDN Web Docs: developer.mozilla.org
  - JavaScript.info: javascript.info
  - CSS Tricks: css-tricks.com

Backend:
  - Node.js Docs: nodejs.org/docs
  - Express Guide: expressjs.com/guide
  - MongoDB University: university.mongodb.com

도구:
  - Postman: API 테스트
  - MongoDB Compass: DB 관리
  - VS Code Extensions: ESLint, Prettier
```

---

## 🎯 우선순위 요약

### Phase 1 (필수) - 2-3주
```
1. 메인 사이트 개선 (필터링, 정렬, 페이지네이션)
2. 차량 상세 모달
3. 즐겨찾기 기능
4. 반응형 개선
```

### Phase 2 (중요) - 2-3주
```
5. 백엔드 API 구축 (Node.js + MongoDB)
6. API 연동
7. 인증 시스템 JWT 전환
8. 이미지 업로드 서버 구현
```

### Phase 3 (선택) - 1-2주
```
9. 리뷰/평점 시스템
10. 예약 시스템
11. 통계 대시보드
12. Excel 내보내기
```

### Phase 4 (고급) - 1-2주
```
13. 다크모드
14. 비교 기능
15. 검색 자동완성
16. 알림 시스템
```

---

## ✅ 완료 기준

각 단계별로 다음 기준을 충족해야 완료로 간주:

```
✅ 기능 동작 확인
✅ 모든 테스트 통과
✅ 반응형 동작 확인
✅ 코드 리뷰 완료
✅ 문서화 완료
✅ 배포 성공
```

---

## 📞 Claude에게 요청 시 사용법

이 문서의 각 섹션을 복사하여 다음과 같이 요청하세요:

```
예시 1:
"위 설계도의 'A-1. 고급 필터링 시스템'을 구현해주세요.
파일은 기존 index.html, script.js, style.css를 수정하고,
필요하면 filter-advanced.js를 새로 생성하세요."

예시 2:
"B-1. Excel/CSV 내보내기 기능을 구현해주세요.
SheetJS 라이브러리를 사용하고, export.js 파일을 생성하세요."

예시 3:
"C. 백엔드 서버 구축의 'server.js'와 'routes/cars.js'를 작성해주세요."
```

---

**🎉 이 설계도로 완벽한 Car Manager 시스템을 구축하세요!**

모든 기능은 독립적으로 구현 가능하며, 순차적으로 진행해도 됩니다.
