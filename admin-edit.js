// ==========================================
// 차량 수정 JavaScript
// ==========================================

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

// URL에서 차량 ID 가져오기
function getCarIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // UUID는 문자열이므로 parseInt 제거
}

// 이미지 업로드 기능
document.addEventListener('DOMContentLoaded', function() {
    const imageFileInput = document.getElementById('imageFile');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    // 이미지 파일 업로드
    imageFileInput.addEventListener('change', function(e) {
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
        reader.onload = function(event) {
            const base64 = event.target.result;

            // URL 입력 필드에 Base64 저장
            imageInput.value = base64;

            // 미리보기 표시
            previewImg.src = base64;
            imagePreview.style.display = 'block';

            Toast.success('이미지가 업로드되었습니다!');
        };

        reader.onerror = function() {
            Toast.error('이미지 업로드 중 오류가 발생했습니다.');
        };

        reader.readAsDataURL(file);
    });
});

// 차량 데이터 불러오기
function loadCarData() {
    const carId = getCarIdFromUrl();

    if (!carId) {
        Toast.error('잘못된 접근입니다.');
        setTimeout(() => {
            window.location.href = 'admin-list.html';
        }, 1000);
        return;
    }

    const db = getDB();
    const car = db.cars.find(c => c.id === carId);

    if (!car) {
        Toast.error('차량을 찾을 수 없습니다.');
        setTimeout(() => {
            window.location.href = 'admin-list.html';
        }, 1000);
        return;
    }

    // 폼에 데이터 채우기
    document.getElementById('carId').value = car.id;
    document.getElementById('brand').value = car.brand;
    document.getElementById('name').value = car.name;
    document.getElementById('grade').value = car.grade || '';
    document.getElementById('price').value = car.price;
    document.getElementById('image').value = car.image || '';

    // 기존 이미지가 있으면 미리보기 표시
    if (car.image) {
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('imagePreview');
        previewImg.src = car.image;
        imagePreview.style.display = 'block';
    }
}

// 수정 폼 제출
document.getElementById('editCarForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const carId = document.getElementById('carId').value; // UUID는 문자열
    const brand = document.getElementById('brand').value;
    const name = document.getElementById('name').value;
    const grade = document.getElementById('grade').value;
    const priceValue = document.getElementById('price').value;
    const image = document.getElementById('image').value;

    // 종합 검증
    const carData = {
        brand: brand,
        name: name,
        grade: grade,
        price: priceValue,
        image: image
    };

    const validationResult = Validator.validateCarData(carData);
    if (!validationResult.valid) {
        Toast.error('입력 오류: ' + validationResult.message);
        return;
    }

    const price = parseInt(priceValue, 10);

    // DB에서 차량 찾아서 업데이트
    const db = getDB();
    const carIndex = db.cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        Toast.error('차량을 찾을 수 없습니다.');
        return;
    }

    // 업데이트
    db.cars[carIndex] = {
        id: carId,
        brand: brand,
        name: name,
        grade: grade,
        price: price,
        image: image
    };

    saveDB(db);

    Toast.success('차량 정보가 수정되었습니다!');
    setTimeout(() => {
        window.location.href = 'admin-list.html';
    }, 1000);
});

// 페이지 로드 시 데이터 불러오기
loadCarData();
