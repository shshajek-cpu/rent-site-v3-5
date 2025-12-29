// ==========================================
// 옵션 관리 FAB - 개선된 버전
// ==========================================

// Toast 메시지 표시 함수
function showToast(message, type = 'info') {
    // Toast 컨테이너 확인 및 생성
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            z-index: var(--z-toast, 400);
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    // Toast 요소 생성
    const toast = document.createElement('div');
    const bgColors = {
        info: '#DC2626',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
    };

    toast.style.cssText = `
        background: ${bgColors[type] || bgColors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        pointer-events: auto;
        max-width: 350px;
        text-align: center;
    `;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // 애니메이션
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // 자동 제거
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 옵션 토글 모드 - 개선된 버전
function toggleOptionMode() {
    const optionList = document.getElementById('optionList');
    const fabBtn = document.getElementById('mainOptionFab');
    const fabText = document.querySelector('.fab-text');
    const fabIcon = document.querySelector('.fab-icon');

    // 현재 열림 상태 확인
    const isOpen = optionList.style.display !== 'none';

    if (!isOpen) {
        // ===== 열기 액션 =====
        optionList.style.display = 'block';

        // Wrapper 활성화 (공간 확장)
        const wrapper = document.querySelector('.options-container-wrapper');
        if (wrapper) {
            wrapper.classList.add('active');
        }

        // 선택된 옵션 카드 숨김
        const selectedCard = document.getElementById('selectedOptionsCard');
        if (selectedCard) {
            selectedCard.style.display = 'none';
        }

        // 견적요청 버튼 숨김
        const requestQuoteBtn = document.getElementById('requestQuoteBtn');
        if (requestQuoteBtn) {
            requestQuoteBtn.style.display = 'none';
        }

        // ARIA 속성 업데이트
        fabBtn.setAttribute('aria-expanded', 'true');

        // 버튼 상태: 확정
        fabText.textContent = '옵션 확정';
        fabIcon.className = 'fas fa-check fab-icon';

        // 🔥 개선: 스크롤 타이밍 최적화
        // 애니메이션 완료 후 + 화면에 보이지 않을 때만 스크롤
        setTimeout(() => {
            const rect = optionList.getBoundingClientRect();
            const isVisible = rect.top >= 60 && rect.bottom <= window.innerHeight;

            if (!isVisible) {
                optionList.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest' // center 대신 nearest 사용
                });
            }
        }, 350); // slideDown 애니메이션(300ms) 완료 후

    } else {
        // ===== 닫기 액션 =====

        // 선택 여부 확인
        const hasSelection = document.querySelectorAll('.option-item.selected').length > 0;

        // 🔥 개선: 선택 없이 확정 시 경고
        if (!hasSelection) {
            showToast('⚠️ 최소 1개 이상의 옵션을 선택해주세요', 'warning');
            return; // 닫지 않음
        }

        // 리스트 닫기
        optionList.style.display = 'none';

        // ARIA 속성 업데이트
        fabBtn.setAttribute('aria-expanded', 'false');

        // 버튼 상태: 수정
        fabText.textContent = '옵션 수정';
        fabIcon.className = 'fas fa-pen fab-icon';

        // 🔥 개선: 확정 완료 피드백
        const selectedCount = document.querySelectorAll('.option-item.selected').length;
        showToast(`✅ ${selectedCount}개 옵션이 추가되었습니다`, 'success');

        // 🔥 신규: 선택된 옵션 카드 표시
        updateSelectedOptionsDisplay();

        // 🔥 신규: 선택된 옵션 카드로 자동 스크롤
        setTimeout(() => {
            const card = document.getElementById('selectedOptionsCard');
            if (card && card.style.display !== 'none') {
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 300); // 카드 표시 애니메이션 후

        // 견적요청 버튼 표시
        const requestQuoteBtn = document.getElementById('requestQuoteBtn');
        if (requestQuoteBtn) {
            requestQuoteBtn.style.display = 'flex';
        }
    }
}

// 옵션 선택 토글 - 개선된 버전
function toggleOption(element) {
    const wasSelected = element.classList.contains('selected');
    element.classList.toggle('selected');
    const isSelected = element.classList.contains('selected');

    // ARIA 속성 업데이트
    element.setAttribute('aria-pressed', isSelected.toString());

    // 🔥 개선: 즉각적인 선택 피드백
    const optName = element.querySelector('.opt-name').textContent;
    const optPrice = element.querySelector('.opt-price').textContent;

    if (isSelected) {
        showToast(`${optName} ${optPrice}`, 'info');

        // 🔥 신규: 선택된 옵션 카드로 부드럽게 스크롤
        setTimeout(() => {
            const card = document.getElementById('selectedOptionsCard');
            if (card && card.style.display !== 'none') {
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });

                // 새로 추가된 아이템 강조
                setTimeout(() => {
                    const items = card.querySelectorAll('.selected-option-item');
                    const lastItem = items[items.length - 1];
                    if (lastItem) {
                        lastItem.style.animation = 'highlightNew 1s ease-out';
                        // 애니메이션 종료 후 제거
                        setTimeout(() => {
                            lastItem.style.animation = '';
                        }, 1000);
                    }
                }, 100);
            }
        }, 400); // 펄스 애니메이션 완료 후
    } else {
        showToast(`${optName} 제거됨`, 'info');
    }

    // 🔥 개선: FAB 버튼 텍스트 동적 업데이트 (열림 상태일 때만)
    const optionList = document.getElementById('optionList');
    if (optionList.style.display !== 'none') {
        updateFabButtonText();
    }
}

// 🔥 신규: FAB 버튼 텍스트 동적 업데이트
function updateFabButtonText() {
    const fabText = document.querySelector('.fab-text');
    const selectedCount = document.querySelectorAll('.option-item.selected').length;

    if (selectedCount > 0) {
        fabText.textContent = `옵션 확정 (${selectedCount})`;
    } else {
        fabText.textContent = '옵션 확정';
    }
}

// ==========================================
// 선택된 옵션 표시 및 관리
// ==========================================

// 선택된 옵션 카드 업데이트
function updateSelectedOptionsDisplay() {
    const selectedOptions = document.querySelectorAll('.option-item.selected');
    const card = document.getElementById('selectedOptionsCard');
    const list = document.getElementById('selectedOptionsList');
    const countBadge = document.getElementById('optionCountBadge');

    if (selectedOptions.length === 0) {
        // 선택된 옵션이 없으면 카드 숨김
        card.style.display = 'none';
        return;
    }

    // 카드 표시
    card.style.display = 'block';
    countBadge.textContent = selectedOptions.length;

    // 옵션 리스트 생성
    list.innerHTML = Array.from(selectedOptions).map((option, index) => {
        const name = option.querySelector('.opt-name').textContent;
        const priceText = option.querySelector('.opt-price').textContent;
        const icon = option.dataset.icon || 'fa-check';

        return `
            <div class="selected-option-item">
                <div class="option-info">
                    <div class="option-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="option-details">
                        <div class="option-name">${name}</div>
                        <div class="option-price">${priceText}</div>
                    </div>
                </div>
                <button class="btn-remove-option"
                        onclick="removeOption('${name}')"
                        aria-label="${name} 제거">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    // 가격 계산 업데이트
    updatePriceCalculations();
}

// 개별 옵션 제거
function removeOption(optionName) {
    const options = document.querySelectorAll('.option-item');
    options.forEach(option => {
        const name = option.querySelector('.opt-name').textContent;
        if (name === optionName) {
            option.classList.remove('selected');
            option.setAttribute('aria-pressed', 'false');
        }
    });

    updateSelectedOptionsDisplay();
    showToast(`${optionName} 제거됨`, 'info');
}

// 전체 옵션 삭제
function clearAllOptions(force = false) {
    const selectedOptions = document.querySelectorAll('.option-item.selected');

    // If forcing (switching cars), we must reset UI even if no options found (because they were just re-rendered)
    if (selectedOptions.length === 0 && !force) return;

    if (force || confirm(`선택된 ${selectedOptions.length}개의 옵션을 모두 삭제하시겠습니까?`)) {
        selectedOptions.forEach(option => {
            option.classList.remove('selected');
            option.setAttribute('aria-pressed', 'false');
        });

        // UI Reset
        updateSelectedOptionsDisplay();

        // FAB 버튼 상태 초기화
        const fabText = document.querySelector('.fab-text');
        const fabIcon = document.querySelector('.fab-icon');
        if (fabText) fabText.textContent = '옵션 추가';
        if (fabIcon) fabIcon.className = 'fas fa-plus fab-icon';

        // Card & Price Reset
        const selectedCard = document.getElementById('selectedOptionsCard');
        if (selectedCard) selectedCard.style.display = 'none';

        // 견적요청 버튼 숨김
        const requestQuoteBtn = document.getElementById('requestQuoteBtn');
        if (requestQuoteBtn) requestQuoteBtn.style.display = 'none';

        // Wrapper 비활성화 (공간 축소)
        const wrapper = document.querySelector('.options-container-wrapper');
        if (wrapper) {
            wrapper.classList.remove('active');
        }

        // Reset Price Calculation
        updatePriceCalculations();

        if (!force) showToast('모든 옵션이 삭제되었습니다', 'success');
    }
}

// 가격 계산 및 표시
function updatePriceCalculations() {
    const selectedOptions = document.querySelectorAll('.option-item.selected');

    // 기본 렌탈료 (선택된 차량의 가격 - 임시로 650,000원 사용)
    const basePrice = window.selectedCar?.price || 650000;

    // 옵션 추가금 계산
    let optionsTotal = 0;
    selectedOptions.forEach(option => {
        const price = parseInt(option.dataset.price || 0);
        optionsTotal += price;
    });

    // 총 렌탈료
    const totalPrice = basePrice + optionsTotal;

    // DOM 업데이트
    document.getElementById('basePrice').textContent = basePrice.toLocaleString() + '원';
    document.getElementById('optionsTotal').textContent = '+' + optionsTotal.toLocaleString() + '원';
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString() + '원';
}

// 🔥 신규: 초기화 및 안내
document.addEventListener('DOMContentLoaded', () => {
    // 옵션 리스트 초기 숨김 확인
    const optionList = document.getElementById('optionList');
    if (optionList) optionList.style.display = 'none';

    // 선택된 옵션 카드 초기 숨김
    const selectedCard = document.getElementById('selectedOptionsCard');
    if (selectedCard) selectedCard.style.display = 'none';

    // 첫 방문 사용자 가이드 (1회만)
    const hasSeenGuide = localStorage.getItem('fab-guide-shown');
    if (!hasSeenGuide) {
        setTimeout(() => {
            showToast('💡 차량에 옵션을 추가하려면 우측 하단 버튼을 눌러주세요!', 'info');
            localStorage.setItem('fab-guide-shown', 'true');
        }, 2000);
    }
});
