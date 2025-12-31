// Admin Quotes Management
let currentQuotes = [];
let editingQuoteId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    updateStats();
});

// Load quotes from localStorage
function loadQuotes() {
    const adminQuotes = JSON.parse(localStorage.getItem('adminQuotes') || '[]');
    currentQuotes = adminQuotes;
    renderQuotesTable();
    updateStats();
}

// Render table
function renderQuotesTable() {
    const tbody = document.getElementById('quotesTableBody');

    if (currentQuotes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-sub);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>아직 제출된 견적이 없습니다.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentQuotes.map((quote, index) => {
        const status = quote.adminFinalPrice ? 'completed' : 'pending';
        const statusText = quote.adminFinalPrice ? '완료' : '분석중';
        const statusClass = quote.adminFinalPrice ? 'status-active' : 'status-inactive';

        // 약정개월, 약정거리 추출
        const term = quote.selectedOptions?.term || '60개월';
        const mileage = quote.selectedOptions?.mileage || '10,000km';

        // 옵션 상세 표시
        const optionsList = (quote.options || []).map(opt => opt.name).join('<br>');
        const optionsDisplay = optionsList || '<span style="color: #666;">-</span>';

        // 고객 번호 표시 (010-xxxx-xxxx 형식)
        const customerPhone = quote.customerPhone || '-';

        // 버튼 텍스트와 클래스를 조건부로 설정
        const buttonText = quote.adminFinalPrice ? '가격 수정' : '가격입력';
        const buttonClass = quote.adminFinalPrice ? 'btn-primary' : 'btn-secondary';

        return `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td style="font-family: 'Courier New', monospace;">${customerPhone}</td>
                <td>${new Date(quote.timestamp).toLocaleString('ko-KR')}</td>
                <td>
                    <strong>${quote.car.name}</strong>
                </td>
                <td>${quote.car.grade || '-'}</td>
                <td>${term}</td>
                <td>${mileage}</td>
                <td style="font-size: 0.85rem; line-height: 1.6;">${optionsDisplay}</td>
                <td style="font-family: 'Courier New', monospace; color: var(--text-sub);">
                    ${quote.totalPrice ? quote.totalPrice.toLocaleString() + '원' : '-'}
                </td>
                <td style="font-family: 'Courier New', monospace;">
                    ${quote.adminFinalPrice ?
                `<strong style="color: var(--primary-color);">${quote.adminFinalPrice.toLocaleString()}원</strong>` :
                '-'
            }
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="${buttonClass}" onclick="openEditModal('${quote.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                        <i class="fas fa-edit"></i> ${buttonText}
                    </button>
                    <button class="btn-delete" onclick="deleteQuote('${quote.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-left: 0.5rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update stats
function updateStats() {
    const total = currentQuotes.length;
    const pending = currentQuotes.filter(q => !q.adminFinalPrice).length;
    const completed = currentQuotes.filter(q => q.adminFinalPrice).length;
    const requotes = currentQuotes.filter(q => q.isRequote === true).length;

    document.getElementById('totalQuotes').textContent = total;
    document.getElementById('pendingQuotes').textContent = pending;
    document.getElementById('completedQuotes').textContent = completed;

    const requoteCountEl = document.getElementById('requoteCount');
    if (requoteCountEl) {
        requoteCountEl.textContent = requotes;
    }
}

// Open edit modal
function openEditModal(quoteId) {
    const quote = currentQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    editingQuoteId = quoteId;

    // Populate modal
    document.getElementById('modalCarInfo').innerHTML = `
        <strong>${quote.car.name}</strong> ${quote.car.grade || ''}<br>
        <small style="color: var(--text-sub);">옵션: ${(quote.options || []).map(o => o.name).join(', ') || '없음'}</small><br>
        <small style="color: var(--text-sub);">고객 예상가: ${(quote.totalPrice || 0).toLocaleString()}원/월</small>
    `;

    document.getElementById('finalPrice').value = quote.adminFinalPrice || '';
    document.getElementById('editQuoteId').value = quoteId;

    // Show modal
    document.getElementById('editQuoteModal').classList.add('active');
}

// Close modal
function closeEditModal() {
    document.getElementById('editQuoteModal').classList.remove('active');
    editingQuoteId = null;
}

// Save final price
function saveQuoteFinalPrice(event) {
    event.preventDefault();

    const quoteId = document.getElementById('editQuoteId').value;
    const finalPrice = parseInt(document.getElementById('finalPrice').value);

    if (!finalPrice || finalPrice <= 0) {
        alert('올바른 가격을 입력해주세요.');
        return;
    }

    // Update in adminQuotes
    const adminQuotes = JSON.parse(localStorage.getItem('adminQuotes') || '[]');
    const quote = adminQuotes.find(q => q.id === quoteId);
    if (quote) {
        quote.adminFinalPrice = finalPrice;
        localStorage.setItem('adminQuotes', JSON.stringify(adminQuotes));
    }

    // Also update in savedQuotes (customer's view)
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');

    // Fix: For requotes, we need to find the original quote ID
    // If quote.originalQuoteId exists, use it. Otherwise use quoteId.
    const targetCustomerQuoteId = quote.originalQuoteId || quoteId;
    const customerQuote = savedQuotes.find(q => q.id === targetCustomerQuoteId);

    if (customerQuote) {
        customerQuote.adminFinalPrice = finalPrice;
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    }

    // 커스텀 이벤트 발송 (동일 탭에서 실시간 업데이트용)
    window.dispatchEvent(new CustomEvent('quotePriceUpdated', {
        detail: { quoteId: quoteId, finalPrice: finalPrice }
    }));

    // Success feedback
    alert('최종 렌탈료가 저장되었습니다!');

    closeEditModal();
    loadQuotes();
}

// Delete quote
function deleteQuote(quoteId) {
    if (!confirm('이 견적을 삭제하시겠습니까?')) return;

    const adminQuotes = JSON.parse(localStorage.getItem('adminQuotes') || '[]');
    const quoteToDelete = adminQuotes.find(q => q.id === quoteId);

    // 1. Delete from Admin Quotes
    const filtered = adminQuotes.filter(q => q.id !== quoteId);
    localStorage.setItem('adminQuotes', JSON.stringify(filtered));

    // 2. Delete from User's Saved Quotes (Sync)
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    // Also remove if it matches id or originalQuoteId (for requotes)
    const newSavedQuotes = savedQuotes.filter(q => q.id !== quoteId && q.id !== quoteToDelete?.originalQuoteId);
    localStorage.setItem('savedQuotes', JSON.stringify(newSavedQuotes));

    loadQuotes();
}

// Logout
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-list.html';
    }
}

// Auto-refresh when localStorage changes (e.g. deletion from customer view)
window.addEventListener('storage', (event) => {
    if (event.key === 'adminQuotes') {
        loadQuotes();
    }
});
