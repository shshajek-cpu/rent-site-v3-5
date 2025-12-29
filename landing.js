// 전화번호 자동 하이픈 포맷
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/[^0-9]/g, '');

    if (value.length <= 3) {
        e.target.value = value;
    } else if (value.length <= 7) {
        e.target.value = value.substring(0, 3) + '-' + value.substring(3);
    } else {
        e.target.value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
    }
});

// 폼 제출 처리
const form = document.getElementById('consultForm');
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const carModel = document.getElementById('carModel').value;

    // 유효성 검사
    if (!name || !phone || !carModel) {
        alert('모든 항목을 입력해주세요.');
        return;
    }

    // 전화번호 형식 검사
    const phonePattern = /^010-\d{4}-\d{4}$/;
    if (!phonePattern.test(phone)) {
        alert('올바른 전화번호 형식을 입력해주세요. (010-0000-0000)');
        return;
    }

    // 현재 시간
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 데이터 객체 생성
    const inquiry = {
        id: Date.now(),
        name: name,
        phone: phone,
        carModel: carModel,
        timestamp: timestamp,
        memo: '',
        verified: false  // 인증 여부 (메인페이지 로그인 시 true로 변경)
    };

    // localStorage에 저장
    let inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
    inquiries.push(inquiry);
    localStorage.setItem('inquiries', JSON.stringify(inquiries));

    // 성공 모달 표시
    showSuccessModal();

    // 폼 초기화
    form.reset();
});

// 성공 모달 표시
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
}
