// Check LS or Init
function getDB() {
    const local = localStorage.getItem('carDB');
    if (local) {
        return JSON.parse(local);
    }
    // Return empty starter if nothing exists (script.js will handle seeding main data)
    // Or we can verify existing structural integrity.
    return { brands: [], cars: [] };
}

function saveDB(data) {
    localStorage.setItem('carDB', JSON.stringify(data));
}

// 실시간 검증 및 이미지 업로드 추가
document.addEventListener('DOMContentLoaded', function() {
    const priceInput = document.getElementById('price');
    const imageInput = document.getElementById('image');
    const imageFileInput = document.getElementById('imageFile');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (priceInput) {
        // 가격 실시간 검증
        priceInput.addEventListener('blur', function() {
            const result = Validator.validatePrice(this.value);
            if (!result.valid) {
                Validator.showFieldError(this, result.message);
            } else {
                Validator.clearFieldError(this);
            }
        });
    }

    if (imageInput) {
        // 이미지 URL 실시간 검증
        imageInput.addEventListener('blur', function() {
            const result = Validator.validateUrl(this.value);
            if (!result.valid) {
                Validator.showFieldError(this, result.message);
            } else {
                Validator.clearFieldError(this);
            }
        });
    }

    if (imageFileInput) {
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
                if(imageInput) imageInput.value = base64;

                // 미리보기 표시
                if(previewImg) previewImg.src = base64;
                if(imagePreview) imagePreview.style.display = 'block';

                Toast.success('이미지가 업로드되었습니다!');
            };

            reader.onerror = function() {
                Toast.error('이미지 업로드 중 오류가 발생했습니다.');
            };

            reader.readAsDataURL(file);
        });
    }
});

const carForm = document.getElementById('carForm');
if (carForm) {
    carForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // 1. Collect Data
        const brand = document.getElementById('brand').value;
        const name = document.getElementById('name').value;
        const grade = document.getElementById('grade').value;
        const priceValue = document.getElementById('price').value;
        const mileage = document.getElementById('mileage').value;
        const image = document.getElementById('image').value;

        // 2. 종합 검증
        const carData = {
            brand: brand,
            name: name,
            grade: grade,
            price: priceValue,
            mileage: mileage,
            image: image
        };

        const validationResult = Validator.validateCarData(carData);
        if (!validationResult.valid) {
            Toast.error('입력 오류: ' + validationResult.message);
            return;
        }

        const price = parseInt(priceValue, 10);

        // 3. Read DB
        const db = getDB();

        // Generate New ID (UUID 기반)
        const newId = Utils.generateUUID();

        // 4. Construct Object
        const newCar = {
            id: newId,
            brand: brand,
            name: name,
            grade: grade,
            mileage: mileage,
            price: price,
            image: image
        };

        // 5. Append & Save
        db.cars.push(newCar);
        saveDB(db);

        // 6. Feedback
        Toast.success(`[${brand}] ${name} 차량이 등록되었습니다!`);

        // Reset inputs
        e.target.reset();
    });
}

// Sidebar Toggle Logic (Accordion)
function toggleNavGroup(element) {
    const group = element.closest('.nav-group');
    if (group) {
        group.classList.toggle('active');
    }
}