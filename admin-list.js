// ==========================================
// 차량 목록 관리 JavaScript
// ==========================================

// DB 함수들
function getDB() {
    const local = localStorage.getItem('carDB');
    if (local) {
        return JSON.parse(local);
    }
    return { brands: [], cars: [] };
}

function saveDB(data) {
    localStorage.setItem('carDB', JSON.stringify(data));
}

// 브랜드 이름 매핑
const brandNames = {
    hyundai: '현대',
    kia: '기아',
    genesis: '제네시스',
    benz: '벤츠',
    bmw: 'BMW'
};

// 정렬 상태 (manual | asc | desc)
let currentSort = 'manual';
let dragSrcEl = null;
let localDB = null; // In-memory DB for reordering
let isDirty = false; // Track changes

// 초기화
document.addEventListener('DOMContentLoaded', function () {
    localDB = getDB(); // Load initial state
    updateStats();
    renderCarList();

    // ... (other event listeners) ...
});

function getLocalDB() {
    if (!localDB) localDB = getDB();
    return localDB;
}

// 순서 저장 함수
window.saveOrder = function () {
    if (!isDirty) return;

    saveDB(localDB);
    isDirty = false;
    document.getElementById('saveOrderBtn').style.display = 'none';
    Toast.success('메인 홈페이지에 순서가 반영되었습니다!');
};

// 정렬 토글 함수
window.toggleSort = function (field) {
    if (field !== 'price') return;

    const th = document.getElementById('th-price');
    const icon = th.querySelector('.sort-icon');

    // Cycle: manual -> asc -> desc -> manual
    let nextSort;
    if (currentSort === 'manual') nextSort = 'asc';
    else if (currentSort === 'asc') nextSort = 'desc';
    else nextSort = 'manual'; // Back to original saved order

    currentSort = nextSort;

    // UI 업데이트
    th.classList.remove('asc', 'desc');
    icon.className = 'fas fa-sort sort-icon';

    if (currentSort === 'manual') {
        // 원래 저장된 순서로 복구
        localDB = getDB();
        isDirty = false;
        document.getElementById('saveOrderBtn').style.display = 'none';
        Toast.info('기본 순서로 복구되었습니다.');
    } else {
        // 메모리 상에서 정렬 적용
        if (currentSort === 'asc') {
            localDB.cars.sort((a, b) => a.price - b.price);
            th.classList.add('asc');
            icon.className = 'fas fa-sort-up sort-icon';
            Toast.info('렌탈료 오름차순 (저장 가능)');
        } else {
            localDB.cars.sort((a, b) => b.price - a.price);
            th.classList.add('desc');
            icon.className = 'fas fa-sort-down sort-icon';
            Toast.info('렌탈료 내림차순 (저장 가능)');
        }

        // 변경사항 발생 -> 저장 버튼 활성화
        isDirty = true;
        document.getElementById('saveOrderBtn').style.display = 'inline-flex';
    }

    renderCarList(document.getElementById('searchInput')?.value || '');
};

// 차량 목록 렌더링
function renderCarList(searchTerm = '') {
    const db = getLocalDB(); // Use memory DB
    const tbody = document.getElementById('carTableBody');

    // 1. 검색 필터링
    let filteredCars = db.cars;
    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredCars = db.cars.filter(car =>
            car.brand.toLowerCase().includes(search) ||
            car.name.toLowerCase().includes(search) ||
            (brandNames[car.brand] && brandNames[car.brand].toLowerCase().includes(search))
        );
    }

    // 2. 정렬 로직 삭제 (이미 toggleSort에서 localDB를 정렬함)
    // WYSIWYG: localDB 순서 그대로 렌더링

    // 빈 상태
    if (filteredCars.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>${searchTerm ? '검색 결과가 없습니다.' : '등록된 차량이 없습니다.'}</p>
                </td>
            </tr>
        `;
        return;
    }

    // 테이블 행 생성
    tbody.innerHTML = filteredCars.map((car, index) => {
        // 검색어가 없을 때만 드래그 가능 (정렬 상태여도 드래그 허용 -> Custom Order가 됨)
        const isDraggable = !searchTerm;
        const dragHandle = isDraggable
            ? `<i class="fas fa-grip-vertical drag-handle"></i>`
            : `<i class="fas fa-grip-vertical drag-handle" style="opacity: 0.1; cursor: default;"></i>`;

        return `
        <tr class="draggable-row" 
            draggable="${isDraggable}" 
            data-id="${car.id}"
            ondragstart="handleDragStart(event)"
            ondragover="handleDragOver(event)"
            ondragleave="handleDragLeave(event)"
            ondrop="handleDrop(event)"
            ondragend="handleDragEnd(event)">
            <td style="text-align: center;">${dragHandle}</td>
            <td>
                <input type="checkbox" class="car-checkbox" value="${car.id}"
                       onchange="updateSelection('${car.id}', this.checked)"
                       style="width: 18px; height: 18px; cursor: pointer;">
            </td>
            <td>
                ${car.image
                ? `<img src="${car.image}" class="car-image" alt="${car.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="car-icon" style="display:none;"><i class="fas fa-car"></i></div>`
                : `<div class="car-icon"><i class="fas fa-car"></i></div>`
            }
            </td>
            <td>
                <span class="brand-badge brand-${car.brand}">
                    ${brandNames[car.brand] || car.brand}
                </span>
            </td>
            <td><strong>${car.name}</strong></td>
            <td>${car.grade || '-'}</td>
            <td>${car.mileage || '-'}</td>
            <td><strong>${car.price.toLocaleString()}원</strong></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editCar('${car.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-copy" onclick="duplicateCar('${car.id}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteCar('${car.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// ==========================================
// Drag & Drop Handlers
// ==========================================
window.handleDragStart = function (e) {
    if (document.getElementById('searchInput')?.value) return false; // 검색 중 드래그 방지
    dragSrcEl = e.target.closest('tr');
    e.target.closest('tr').classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

window.handleDragOver = function (e) {
    if (e.preventDefault) e.preventDefault();
    if (document.getElementById('searchInput')?.value) return false;
    e.dataTransfer.dropEffect = 'move';
    // Visual placeholder logic could go here
    return false;
}

window.handleDragLeave = function (e) {
    // Optional: remove visual indicators
}

window.handleDrop = function (e) {
    if (e.stopPropagation) e.stopPropagation();
    // 검색 중이면 드롭 무시
    if (document.getElementById('searchInput')?.value) return false;
    if (dragSrcEl === e.target.closest('tr')) return false;

    const targetRow = e.target.closest('tr');
    if (!targetRow || !dragSrcEl) return false;

    // Get IDs
    const sourceId = dragSrcEl.getAttribute('data-id');
    const targetId = targetRow.getAttribute('data-id');

    // Reorder DB (Memory)
    const sourceIndex = localDB.cars.findIndex(c => c.id == sourceId);
    const targetIndex = localDB.cars.findIndex(c => c.id == targetId);

    if (sourceIndex > -1 && targetIndex > -1) {
        // Move element
        const [movedCar] = localDB.cars.splice(sourceIndex, 1);
        localDB.cars.splice(targetIndex, 0, movedCar);

        // Mark as dirty & Show Save Button
        isDirty = true;
        document.getElementById('saveOrderBtn').style.display = 'inline-flex';

        // If we dragged, we are technically in 'manual' (custom) order now, 
        // even if we started from sorted.
        // Let's reset the sort icon visually to indicate custom order
        if (currentSort !== 'manual') {
            currentSort = 'manual';
            const th = document.getElementById('th-price');
            const icon = th.querySelector('.sort-icon');
            th.classList.remove('asc', 'desc');
            icon.className = 'fas fa-sort sort-icon';
        }

        renderCarList();
        // Toast.info('순서가 변경되었습니다.');
    }

    return false;
}

window.handleDragEnd = function (e) {
    e.target.closest('tr').classList.remove('dragging');
    document.querySelectorAll('.draggable-row').forEach(row => {
        row.classList.remove('over');
    });
}

// 통계 업데이트
function updateStats() {
    const db = getDB();
    const cars = db.cars;

    // 전체 차량 수
    document.getElementById('totalCars').textContent = cars.length;

    // 평균 렌탈료
    if (cars.length > 0) {
        const avgPrice = Math.round(cars.reduce((sum, car) => sum + car.price, 0) / cars.length);
        document.getElementById('avgPrice').textContent = avgPrice.toLocaleString() + '원';
    } else {
        document.getElementById('avgPrice').textContent = '0원';
    }

    // 신차 수
    const newCars = cars.filter(car => car.mileage === '신차').length;
    document.getElementById('newCars').textContent = newCars;
}

// 차량 수정 (모달로 변경)
function editCar(id) {
    const db = getDB();
    const car = db.cars.find(c => c.id === id);

    if (!car) {
        Toast.error('차량을 찾을 수 없습니다.');
        return;
    }

    // 폼에 데이터 채우기
    document.getElementById('editCarId').value = car.id;
    document.getElementById('editBrand').value = car.brand;
    document.getElementById('editName').value = car.name;
    document.getElementById('editGrade').value = car.grade || '';
    document.getElementById('editPrice').value = car.price;
    document.getElementById('editMileage').value = car.mileage || '';
    document.getElementById('editImage').value = car.image || '';

    // 이미지 미리보기
    const preview = document.getElementById('editImagePreview');
    const previewImg = document.getElementById('editPreviewImg');
    if (car.image) {
        previewImg.src = car.image;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    // 모달 열기
    document.getElementById('editCarModal').classList.add('active');
    setupEditImageUpload();
}

// 차량 삭제
function deleteCar(id) {
    const db = getDB();
    const car = db.cars.find(c => c.id === id);

    if (!car) {
        Toast.error('차량을 찾을 수 없습니다.');
        return;
    }

    if (confirm(`[${brandNames[car.brand]}] ${car.name} 차량을 정말 삭제하시겠습니까?`)) {
        db.cars = db.cars.filter(c => c.id !== id);
        saveDB(db);

        // localDB 동기화
        localDB = db;

        // 목록 새로고침
        renderCarList();
        updateStats();

        Toast.success('차량이 삭제되었습니다.');
    }
}

// 차량 복사
function duplicateCar(id) {
    const db = getDB();
    const originalCar = db.cars.find(c => c.id === id);

    if (!originalCar) {
        Toast.error('차량을 찾을 수 없습니다.');
        return;
    }

    // 새로운 ID 생성
    const newId = 'car_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 복사본 생성 (모든 속성 복사)
    const duplicatedCar = {
        ...originalCar,
        id: newId,
        name: originalCar.name
    };

    // DB에 추가
    db.cars.push(duplicatedCar);
    saveDB(db);

    // localDB 동기화
    localDB = db;

    // UI 업데이트
    renderCarList();
    updateStats();

    Toast.success(`[${brandNames[originalCar.brand]}] ${originalCar.name} 차량이 복사되었습니다!`);
}

// 검색 기능
document.getElementById('searchInput').addEventListener('input', function (e) {
    renderCarList(e.target.value);
});

// ==========================================
// 대량 등록 기능
// ==========================================

// 모달 열기
function openBulkUploadModal() {
    document.getElementById('bulkUploadModal').classList.add('active');
    setupDragAndDrop();
}

// 모달 닫기
function closeBulkUploadModal() {
    document.getElementById('bulkUploadModal').classList.remove('active');
    document.getElementById('bulkDataInput').value = '';
    document.getElementById('csvFileInput').value = '';
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('csvFileInput');

    // 클릭 시 파일 선택
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 파일 선택 시 처리
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // 드래그 앤 드롭
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });
}

// CSV 파일 읽기
function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
        Toast.error('CSV 파일만 업로드 가능합니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        parseCSV(csvText);
    };
    reader.readAsText(file, 'UTF-8');
}

// CSV 파싱
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        Toast.error('CSV 파일에 데이터가 없습니다.');
        return;
    }

    // 헤더 확인 (선택적)
    const header = lines[0].toLowerCase();
    const startIndex = header.includes('brand') ? 1 : 0;

    const cars = [];
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 5) {
            Toast.warning(`${i + 1}번째 줄: 데이터가 부족합니다. 건너뜁니다.`);
            continue;
        }

        const [brand, name, grade, mileage, priceStr, image] = parts;
        const price = parseInt(priceStr.replace(/[^0-9]/g, ''));

        if (!price || isNaN(price)) {
            Toast.warning(`${i + 1}번째 줄: 가격이 유효하지 않습니다. 건너뜁니다.`);
            continue;
        }

        cars.push({ brand, name, grade, mileage, price, image: image || '' });
    }

    // JSON textarea에 표시
    const jsonData = JSON.stringify(cars, null, 2);
    document.getElementById('bulkDataInput').value = jsonData;

    Toast.success(`${cars.length}개의 차량 데이터를 읽었습니다.`);
}

// 대량 등록 처리
function processBulkUpload() {
    const jsonInput = document.getElementById('bulkDataInput').value.trim();

    if (!jsonInput) {
        Toast.error('등록할 데이터를 입력하거나 CSV 파일을 업로드하세요.');
        return;
    }

    let newCars;
    try {
        newCars = JSON.parse(jsonInput);
    } catch (e) {
        Toast.error('JSON 형식이 올바르지 않습니다.');
        return;
    }

    if (!Array.isArray(newCars) || newCars.length === 0) {
        Toast.error('차량 데이터가 배열 형식이어야 하며, 최소 1개 이상이어야 합니다.');
        return;
    }

    // 유효성 검사
    const validBrands = ['hyundai', 'kia', 'genesis', 'benz', 'bmw'];
    for (let i = 0; i < newCars.length; i++) {
        const car = newCars[i];
        if (!car.brand || !car.name || !car.price) {
            Toast.error(`${i + 1}번째 차량: brand, name, price는 필수입니다.`);
            return;
        }
        if (!validBrands.includes(car.brand.toLowerCase())) {
            Toast.error(`${i + 1}번째 차량: brand는 ${validBrands.join(', ')} 중 하나여야 합니다.`);
            return;
        }
        if (typeof car.price !== 'number' || car.price <= 0) {
            Toast.error(`${i + 1}번째 차량: price는 양수여야 합니다.`);
            return;
        }
    }

    // DB에 추가
    const db = getDB();

    newCars.forEach((car, index) => {
        // 문자열 UUID 생성 (개별등록/복사와 동일한 방식)
        const newId = 'car_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9);

        db.cars.push({
            id: newId,
            brand: car.brand.toLowerCase(),
            name: car.name,
            grade: car.grade || '',
            mileage: car.mileage || '',
            price: car.price,
            image: car.image || ''
        });
    });

    saveDB(db);

    // localDB 동기화 (중요!)
    localDB = db;

    // UI 업데이트
    renderCarList();
    updateStats();
    closeBulkUploadModal();

    Toast.success(`${newCars.length}개의 차량이 등록되었습니다!`);
}

// ==========================================
// 전체 삭제 기능
// ==========================================

function deleteAllCars() {
    const db = getDB();

    if (db.cars.length === 0) {
        Toast.warning('삭제할 차량이 없습니다.');
        return;
    }

    const confirmMsg = `정말로 전체 ${db.cars.length}개의 차량을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // 한 번 더 확인
    const doubleConfirm = confirm('정말로 진행하시겠습니까? 모든 데이터가 삭제됩니다.');

    if (!doubleConfirm) {
        return;
    }

    // 전체 삭제
    db.cars = [];
    saveDB(db);

    // localDB 동기화 (중요!)
    localDB = db;
    isDirty = false;
    document.getElementById('saveOrderBtn').style.display = 'none';

    // UI 업데이트
    renderCarList();
    updateStats();

    Toast.success('모든 차량이 삭제되었습니다.');
}

// ==========================================
// 개별 등록 기능
// ==========================================

// 모달 열기
function openAddCarModal() {
    document.getElementById('addCarModal').classList.add('active');
    setupImageUpload();
}

// 모달 닫기
function closeAddCarModal() {
    document.getElementById('addCarModal').classList.remove('active');
    document.getElementById('carForm').reset();
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
}

// 이미지 업로드 설정
function setupImageUpload() {
    const imageFileInput = document.getElementById('imageFile');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    // 이미지 파일 업로드 (이벤트 리스너가 중복 등록되지 않도록 제거 후 추가)
    const newImageFileInput = imageFileInput.cloneNode(true);
    imageFileInput.parentNode.replaceChild(newImageFileInput, imageFileInput);

    newImageFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            Toast.error('이미지 파일 크기는 5MB 이하여야 합니다.');
            this.value = '';
            return;
        }

        // 이미지 파일인지 확인
        if (!file.type.startsWith('image/')) {
            Toast.error('이미지 파일만 업로드 가능합니다.');
            this.value = '';
            return;
        }

        // FileReader로 Base64 변환
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64 = event.target.result;

            // URL 입력 필드에 Base64 저장
            imageInput.value = base64;

            // 미리보기 표시
            previewImg.src = base64;
            imagePreview.style.display = 'block';

            Toast.success('이미지가 업로드되었습니다!');
        };

        reader.onerror = function () {
            Toast.error('이미지 업로드 중 오류가 발생했습니다.');
        };

        reader.readAsDataURL(file);
    });
}

// 차량 등록 폼 제출
document.addEventListener('DOMContentLoaded', function () {
    const carForm = document.getElementById('carForm');
    if (carForm) {
        carForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // 데이터 수집
            const brand = document.getElementById('brand').value;
            const name = document.getElementById('name').value;
            const grade = document.getElementById('grade').value;
            const priceValue = document.getElementById('price').value;
            const mileage = document.getElementById('mileage').value;
            const image = document.getElementById('image').value;

            // 기본 검증
            if (!brand || !name || !priceValue) {
                Toast.error('브랜드, 모델명, 렌탈료는 필수 항목입니다.');
                return;
            }

            const price = parseInt(priceValue, 10);
            if (isNaN(price) || price <= 0) {
                Toast.error('렌탈료는 0보다 큰 숫자여야 합니다.');
                return;
            }

            // DB에 추가
            const db = getDB();

            // ID 생성 (간단한 UUID 대체)
            const newId = 'car_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            const newCar = {
                id: newId,
                brand: brand,
                name: name,
                grade: grade,
                mileage: mileage,
                price: price,
                image: image
            };

            db.cars.push(newCar);
            saveDB(db);

            // localDB 동기화
            localDB = db;

            // UI 업데이트
            renderCarList();
            updateStats();
            closeAddCarModal();

            Toast.success(`[${brandNames[brand] || brand}] ${name} 차량이 등록되었습니다!`);
        });
    }
});

// ==========================================
// 체크박스 다중 선택 기능
// ==========================================

let selectedCarIds = [];

// 전체 선택/해제
function toggleSelectAll(checkbox) {
    const allCheckboxes = document.querySelectorAll('.car-checkbox');
    selectedCarIds = [];

    allCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        if (checkbox.checked) {
            selectedCarIds.push(cb.value);
        }
    });

    updateSelectionUI();
}

// 개별 선택 업데이트
function updateSelection(carId, isChecked) {
    if (isChecked) {
        if (!selectedCarIds.includes(carId)) {
            selectedCarIds.push(carId);
        }
    } else {
        selectedCarIds = selectedCarIds.filter(id => id !== carId);
        // 전체 선택 체크박스 해제
        document.getElementById('selectAllCheckbox').checked = false;
    }

    updateSelectionUI();
}

// 선택 UI 업데이트
function updateSelectionUI() {
    const count = selectedCarIds.length;
    const countDisplay = document.getElementById('selectedCount');
    const deleteBtn = document.getElementById('deleteSelectedBtn');

    if (count > 0) {
        countDisplay.style.display = 'inline';
        countDisplay.innerHTML = `선택: <strong style="color: #DC2626;">${count}</strong>개`;
        deleteBtn.style.display = 'inline-flex';
    } else {
        countDisplay.style.display = 'none';
        deleteBtn.style.display = 'none';
    }
}

// 선택된 차량 삭제
function deleteSelectedCars() {
    if (selectedCarIds.length === 0) {
        Toast.warning('삭제할 차량을 선택해주세요.');
        return;
    }

    const db = getDB();
    const selectedCars = db.cars.filter(c => selectedCarIds.includes(c.id));
    const carNames = selectedCars.map(c => `[${brandNames[c.brand]}] ${c.name}`).join(', ');

    if (!confirm(`선택한 ${selectedCarIds.length}개의 차량을 정말 삭제하시겠습니까?\n\n${carNames}`)) {
        return;
    }

    // 삭제 실행
    db.cars = db.cars.filter(c => !selectedCarIds.includes(c.id));
    saveDB(db);

    // localDB 동기화
    localDB = db;

    // 선택 초기화
    selectedCarIds = [];
    document.getElementById('selectAllCheckbox').checked = false;

    // UI 업데이트
    renderCarList();
    updateStats();
    updateSelectionUI();

    Toast.success(`${selectedCars.length}개의 차량이 삭제되었습니다.`);
}

// ==========================================
// 차량 수정 모달 기능
// ==========================================

// 수정 모달 닫기
function closeEditModal() {
    document.getElementById('editCarModal').classList.remove('active');
    document.getElementById('editCarForm').reset();
    const imagePreview = document.getElementById('editImagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
}

// 수정 모달 이미지 업로드 설정
function setupEditImageUpload() {
    const imageFileInput = document.getElementById('editImageFile');
    const imageInput = document.getElementById('editImage');
    const imagePreview = document.getElementById('editImagePreview');
    const previewImg = document.getElementById('editPreviewImg');

    // 이미지 파일 업로드 (이벤트 리스너가 중복 등록되지 않도록 제거 후 추가)
    const newImageFileInput = imageFileInput.cloneNode(true);
    imageFileInput.parentNode.replaceChild(newImageFileInput, imageFileInput);

    newImageFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            Toast.error('이미지 파일 크기는 5MB 이하여야 합니다.');
            this.value = '';
            return;
        }

        // 이미지 파일인지 확인
        if (!file.type.startsWith('image/')) {
            Toast.error('이미지 파일만 업로드 가능합니다.');
            this.value = '';
            return;
        }

        // FileReader로 Base64 변환
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64 = event.target.result;

            // URL 입력 필드에 Base64 저장
            imageInput.value = base64;

            // 미리보기 표시
            previewImg.src = base64;
            imagePreview.style.display = 'block';

            Toast.success('이미지가 업로드되었습니다!');
        };

        reader.onerror = function () {
            Toast.error('이미지 업로드 중 오류가 발생했습니다.');
        };

        reader.readAsDataURL(file);
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    updateStats();
    renderCarList();

    // 차량 수정 폼 제출 처리
    const editCarForm = document.getElementById('editCarForm');
    if (editCarForm) {
        editCarForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const carId = document.getElementById('editCarId').value;
            const brand = document.getElementById('editBrand').value;
            const name = document.getElementById('editName').value;
            const grade = document.getElementById('editGrade').value;
            const priceValue = document.getElementById('editPrice').value;
            const mileage = document.getElementById('editMileage').value;
            const image = document.getElementById('editImage').value;

            // 기본 검증
            if (!brand || !name || !priceValue) {
                Toast.error('브랜드, 모델명, 렌탈료는 필수 항목입니다.');
                return;
            }

            const price = parseInt(priceValue, 10);
            if (isNaN(price) || price <= 0) {
                Toast.error('렌탈료는 0보다 큰 숫자여야 합니다.');
                return;
            }

            // DB에서 차량 찾아서 수정
            const db = getDB();
            const carIndex = db.cars.findIndex(c => c.id === carId);

            if (carIndex === -1) {
                Toast.error('차량을 찾을 수 없습니다.');
                return;
            }

            // 차량 정보 업데이트
            db.cars[carIndex] = {
                id: carId,
                brand: brand,
                name: name,
                grade: grade,
                mileage: mileage,
                price: price,
                image: image
            };

            saveDB(db);

            // localDB 동기화
            localDB = db;

            // UI 업데이트
            renderCarList();
            updateStats();
            closeEditModal();

            Toast.success(`[${brandNames[brand] || brand}] ${name} 차량 정보가 수정되었습니다!`);
        });
    }
});
