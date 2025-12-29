// ==========================================
// 입력 검증 유틸리티
// ==========================================

const Validator = {
    // 가격 검증 (0보다 크고 1억 이하)
    validatePrice(price) {
        const numPrice = parseInt(price, 10);

        if (isNaN(numPrice)) {
            return { valid: false, message: '가격은 숫자만 입력 가능합니다.' };
        }

        if (numPrice <= 0) {
            return { valid: false, message: '가격은 0보다 커야 합니다.' };
        }

        if (numPrice > 100000000) {
            return { valid: false, message: '가격은 1억원 이하로 입력해주세요.' };
        }

        return { valid: true };
    },

    // URL 검증
    validateUrl(url) {
        // 빈 값은 허용 (선택 필드)
        if (!url || url.trim() === '') {
            return { valid: true };
        }

        try {
            const urlObj = new URL(url);
            // HTTP/HTTPS만 허용
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, message: 'HTTP 또는 HTTPS URL만 입력 가능합니다.' };
            }
            return { valid: true };
        } catch (e) {
            return { valid: false, message: '올바른 URL 형식이 아닙니다. (예: https://example.com/image.jpg)' };
        }
    },

    // 텍스트 길이 검증
    validateLength(text, fieldName, minLength = 1, maxLength = 100) {
        const trimmed = text.trim();

        if (trimmed.length < minLength) {
            return { valid: false, message: `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.` };
        }

        if (trimmed.length > maxLength) {
            return { valid: false, message: `${fieldName}은(는) 최대 ${maxLength}자 이하여야 합니다.` };
        }

        return { valid: true };
    },

    // 브랜드 검증
    validateBrand(brand) {
        const validBrands = ['hyundai', 'kia', 'genesis', 'benz', 'bmw'];

        if (!validBrands.includes(brand)) {
            return { valid: false, message: '유효한 브랜드를 선택해주세요.' };
        }

        return { valid: true };
    },

    // 종합 차량 데이터 검증
    validateCarData(carData) {
        // 브랜드 검증
        let result = this.validateBrand(carData.brand);
        if (!result.valid) return result;

        // 모델명 검증
        result = this.validateLength(carData.name, '모델명', 1, 50);
        if (!result.valid) return result;

        // 스펙 검증
        if (carData.grade) {
            result = this.validateLength(carData.grade, '스펙', 1, 100);
            if (!result.valid) return result;
        }

        // 가격 검증
        result = this.validatePrice(carData.price);
        if (!result.valid) return result;

        // 주행거리 검증
        if (carData.mileage) {
            result = this.validateLength(carData.mileage, '주행거리', 1, 50);
            if (!result.valid) return result;
        }

        // 이미지 URL 검증
        result = this.validateUrl(carData.image);
        if (!result.valid) return result;

        return { valid: true };
    },

    // 실시간 입력 검증을 위한 필드 스타일 업데이트
    showFieldError(fieldElement, message) {
        fieldElement.style.borderColor = '#EF4444';

        // 기존 에러 메시지 제거
        const existingError = fieldElement.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // 새 에러 메시지 추가
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#EF4444';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '0.3rem';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        fieldElement.parentElement.appendChild(errorDiv);
    },

    clearFieldError(fieldElement) {
        fieldElement.style.borderColor = '';

        const existingError = fieldElement.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
};

// 전역으로 사용 가능하도록 export
window.Validator = Validator;
