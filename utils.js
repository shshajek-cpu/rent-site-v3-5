// ==========================================
// 유틸리티 함수들
// ==========================================

// UUID v4 생성 함수 (RFC 4122 표준)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 타임스탬프 기반 ID 생성 (UUID의 대안)
function generateTimestampId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 숫자 포맷팅 (천 단위 콤마)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 날짜 포맷팅
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 디바운스 함수 (검색 등에 사용)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 전역으로 사용 가능하도록 export
window.Utils = {
    generateUUID,
    generateTimestampId,
    formatNumber,
    formatDate,
    debounce
};
