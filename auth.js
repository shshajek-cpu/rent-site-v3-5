// ==========================================
// 인증 시스템 - 세션 관리
// ==========================================

// 데모용 관리자 계정 (실제 환경에서는 서버에서 검증해야 함)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin1234'
};

// 세션 유효시간 (2시간)
const SESSION_DURATION = 2 * 60 * 60 * 1000;

// ==========================================
// 로그인 체크 함수
// ==========================================
function checkAuth() {
    const session = localStorage.getItem('adminSession');
    if (!session) {
        return false;
    }

    try {
        const sessionData = JSON.parse(session);
        const currentTime = Date.now();

        // 세션 만료 확인
        if (currentTime > sessionData.expiresAt) {
            localStorage.removeItem('adminSession');
            return false;
        }

        return true;
    } catch (e) {
        localStorage.removeItem('adminSession');
        return false;
    }
}

// ==========================================
// 로그인 처리
// ==========================================
function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const sessionData = {
            username: username,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION
        };
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        return true;
    }
    return false;
}

// ==========================================
// 로그아웃 처리
// ==========================================
function logout() {
    localStorage.removeItem('adminSession');
    window.location.href = 'admin-login.html';
}

// ==========================================
// 로그인 페이지 로직 (admin-login.html 전용)
// ==========================================
if (document.getElementById('loginForm')) {
    // 이미 로그인되어 있으면 대시보드로 리다이렉트
    if (checkAuth()) {
        window.location.href = 'admin.html';
    }

    // 비밀번호 표시/숨김 토글
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // 로그인 폼 제출
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        if (login(username, password)) {
            // 로그인 성공
            window.location.href = 'admin.html';
        } else {
            // 로그인 실패
            errorMessage.classList.add('show');
            passwordInput.value = '';
            passwordInput.focus();

            // 3초 후 에러 메시지 자동 숨김
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 3000);
        }
    });
}

// ==========================================
// 관리자 페이지 보호 (admin.html 등에서 사용)
// ==========================================
function protectAdminPage() {
    if (!checkAuth()) {
        window.location.href = 'admin-login.html';
    }
}

// 세션 정보 가져오기
function getSessionInfo() {
    const session = localStorage.getItem('adminSession');
    if (!session) return null;

    try {
        return JSON.parse(session);
    } catch (e) {
        return null;
    }
}
