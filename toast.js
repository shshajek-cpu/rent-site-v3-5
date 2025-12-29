// ==========================================
// 토스트 메시지 시스템
// ==========================================

const Toast = {
    // 토스트 컨테이너 생성 (한 번만 실행)
    init() {
        if (document.getElementById('toast-container')) {
            return; // 이미 존재하면 skip
        }

        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    },

    // 토스트 표시
    show(message, type = 'info', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // 타입별 아이콘
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        // 타입별 색상
        const colors = {
            success: { bg: '#10B981', border: '#059669' },
            error: { bg: '#EF4444', border: '#DC2626' },
            warning: { bg: '#F59E0B', border: '#D97706' },
            info: { bg: '#3B82F6', border: '#2563EB' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            border-left: 4px solid ${color.border};
            font-size: 0.95rem;
            font-weight: 500;
        `;

        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span style="flex: 1;">${message}</span>
            <i class="fas fa-times" style="cursor: pointer; opacity: 0.7; transition: opacity 0.2s;"
               onmouseover="this.style.opacity='1'"
               onmouseout="this.style.opacity='0.7'"></i>
        `;

        // 애니메이션 스타일 추가 (한 번만)
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 닫기 버튼 기능
        const closeBtn = toast.querySelector('.fa-times');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });

        // 컨테이너에 추가
        document.getElementById('toast-container').appendChild(toast);

        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    },

    // 토스트 제거
    remove(toast) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    },

    // 단축 메서드
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    },

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
};

// 전역으로 사용 가능하도록 export
window.Toast = Toast;
