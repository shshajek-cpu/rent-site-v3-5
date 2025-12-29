// ==========================================
// 출고 후기 관리 JavaScript
// ==========================================

// DB 함수들
function getDB() {
    const local = localStorage.getItem('carDB');
    if (local) {
        const db = JSON.parse(local);
        if (!db.reviews) {
            db.reviews = [];
        }
        return db;
    }
    return { brands: [], cars: [], reviews: [] };
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

// 후기 목록 렌더링
function renderReviews(searchTerm = '', brandFilter = '', ratingFilter = '') {
    const db = getDB();
    const tbody = document.getElementById('reviewTableBody');
    const emptyState = document.getElementById('emptyState');

    // 필터링
    let filteredReviews = db.reviews;

    // 검색어 필터
    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredReviews = filteredReviews.filter(review =>
            review.customerName.toLowerCase().includes(search) ||
            review.carName.toLowerCase().includes(search) ||
            (brandNames[review.carBrand] && brandNames[review.carBrand].toLowerCase().includes(search))
        );
    }

    // 브랜드 필터
    if (brandFilter) {
        filteredReviews = filteredReviews.filter(review => review.carBrand === brandFilter);
    }

    // 평점 필터
    if (ratingFilter) {
        const minRating = parseInt(ratingFilter);
        filteredReviews = filteredReviews.filter(review => review.rating >= minRating);
    }

    if (filteredReviews.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'flex';
        emptyState.querySelector('p').textContent = searchTerm || brandFilter || ratingFilter
            ? '검색 결과가 없습니다.'
            : '등록된 출고 후기가 없습니다.';
        return;
    }

    emptyState.style.display = 'none';

    // 최신순 정렬 (날짜 내림차순)
    const sortedReviews = [...filteredReviews].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedReviews.map(review => `
        <tr id="row-${review.id}">
            <td>
                <input type="checkbox" class="review-checkbox" value="${review.id}"
                       onchange="updateSelection('${review.id}', this.checked)"
                       style="width: 18px; height: 18px; cursor: pointer;">
            </td>
            <td>
                <div class="review-rating-display">
                    ${generateStars(review.rating)}
                </div>
            </td>
            <td>
                <span class="brand-badge brand-${review.carBrand}">
                    ${brandNames[review.carBrand] || review.carBrand}
                </span>
            </td>
            <td><strong>${review.carName}</strong></td>
            <td>${review.customerName}</td>
            <td>
                <div class="review-content-cell" title="${review.content}">
                    ${review.content}
                </div>
            </td>
            <td>${review.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="openEditReviewModal('${review.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-copy" onclick="duplicateReview('${review.id}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteReview('${review.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 통계 업데이트
function updateStats() {
    const db = getDB();
    const reviews = db.reviews;

    // 전체 후기 수
    document.getElementById('totalReviews').textContent = reviews.length;

    // 평균 평점
    if (reviews.length > 0) {
        const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        document.getElementById('avgRating').textContent = avgRating;
    } else {
        document.getElementById('avgRating').textContent = '0.0';
    }

    // 5점 후기 수
    const highRated = reviews.filter(r => r.rating === 5).length;
    document.getElementById('highRatedReviews').textContent = highRated;
}

// 별점 생성
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// 후기 삭제
function deleteReview(id) {
    const db = getDB();
    const review = db.reviews.find(r => r.id === id);

    if (!review) {
        Toast.error('후기를 찾을 수 없습니다.');
        return;
    }

    if (confirm(`${review.customerName}님의 후기를 정말 삭제하시겠습니까?`)) {
        db.reviews = db.reviews.filter(r => r.id !== id);
        saveDB(db);
        applyFilters();
        updateStats();
        Toast.success('후기가 삭제되었습니다.');
    }
}

// 후기 복사
function duplicateReview(id) {
    const db = getDB();
    const originalReview = db.reviews.find(r => r.id === id);

    if (!originalReview) {
        Toast.error('후기를 찾을 수 없습니다.');
        return;
    }

    // 새로운 ID 생성
    const newId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 복사본 생성 (날짜는 오늘로 설정)
    const duplicatedReview = {
        ...originalReview,
        id: newId,
        date: new Date().toISOString().split('T')[0]
    };

    // DB에 추가
    db.reviews.push(duplicatedReview);
    saveDB(db);

    // UI 업데이트
    applyFilters();
    updateStats();

    Toast.success('후기가 복사되었습니다!');
}

// ==========================================
// 체크박스 다중 선택 기능
// ==========================================

let selectedReviewIds = [];

// 전체 선택/해제
function toggleSelectAll(checkbox) {
    const allCheckboxes = document.querySelectorAll('.review-checkbox');
    selectedReviewIds = [];

    allCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        if (checkbox.checked) {
            selectedReviewIds.push(cb.value);
            const row = document.getElementById(`row-${cb.value}`);
            if (row) row.classList.add('selected');
        } else {
            const row = document.getElementById(`row-${cb.value}`);
            if (row) row.classList.remove('selected');
        }
    });

    updateSelectionUI();
}

// 개별 선택 업데이트
function updateSelection(reviewId, isChecked) {
    const row = document.getElementById(`row-${reviewId}`);

    if (isChecked) {
        if (!selectedReviewIds.includes(reviewId)) {
            selectedReviewIds.push(reviewId);
        }
        if (row) row.classList.add('selected');
    } else {
        selectedReviewIds = selectedReviewIds.filter(id => id !== reviewId);
        if (row) row.classList.remove('selected');
        // 전체 선택 체크박스 해제
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
    }

    updateSelectionUI();
}

// 선택 UI 업데이트
function updateSelectionUI() {
    const count = selectedReviewIds.length;
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

// 선택된 후기 삭제
function deleteSelectedReviews() {
    if (selectedReviewIds.length === 0) {
        Toast.warning('삭제할 후기를 선택해주세요.');
        return;
    }

    const db = getDB();
    const selectedReviews = db.reviews.filter(r => selectedReviewIds.includes(r.id));
    const reviewNames = selectedReviews.map(r => `${r.customerName}(${brandNames[r.carBrand]} ${r.carName})`).join(', ');

    if (!confirm(`선택한 ${selectedReviewIds.length}개의 후기를 정말 삭제하시겠습니까?\n\n${reviewNames}`)) {
        return;
    }

    // 삭제 실행
    db.reviews = db.reviews.filter(r => !selectedReviewIds.includes(r.id));
    saveDB(db);

    // 선택 초기화
    selectedReviewIds = [];
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;

    // UI 업데이트
    applyFilters();
    updateStats();
    updateSelectionUI();

    Toast.success(`${selectedReviews.length}개의 후기가 삭제되었습니다.`);
}

// 필터 적용 (검색, 브랜드, 평점)
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const brandFilter = document.getElementById('brandFilter')?.value || '';
    const ratingFilter = document.getElementById('ratingFilter')?.value || '';
    renderReviews(searchTerm, brandFilter, ratingFilter);
}

// ==========================================
// 후기 추가 모달
// ==========================================

let selectedRating = 5;

function openAddReviewModal() {
    document.getElementById('addReviewModal').classList.add('active');
    setupRatingInput();
    setupImageUpload();
}

function closeAddReviewModal() {
    document.getElementById('addReviewModal').classList.remove('active');
    document.getElementById('reviewForm').reset();
    selectedRating = 5;
    updateRatingDisplay();
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
}

// 평점 입력 설정
function setupRatingInput() {
    const ratingInput = document.getElementById('ratingInput');
    const stars = ratingInput.querySelectorAll('i');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            document.getElementById('rating').value = selectedRating;
            updateRatingDisplay();
        });

        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            stars.forEach((s, idx) => {
                if (idx < hoverRating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });

    ratingInput.addEventListener('mouseleave', () => {
        updateRatingDisplay();
    });

    // 초기 표시 (5점)
    updateRatingDisplay();
}

function updateRatingDisplay() {
    const stars = document.querySelectorAll('#ratingInput i');
    stars.forEach((star, idx) => {
        if (idx < selectedRating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// 이미지 업로드 설정
function setupImageUpload() {
    const imageFileInput = document.getElementById('imageFile');
    const imageInput = document.getElementById('reviewImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    // 이벤트 리스너 중복 방지
    const newImageFileInput = imageFileInput.cloneNode(true);
    imageFileInput.parentNode.replaceChild(newImageFileInput, imageFileInput);

    newImageFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Toast.error('이미지 파일 크기는 5MB 이하여야 합니다.');
            this.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            Toast.error('이미지 파일만 업로드 가능합니다.');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result;
            imageInput.value = base64;
            previewImg.src = base64;
            imagePreview.style.display = 'block';
            Toast.success('이미지가 업로드되었습니다!');
        };

        reader.onerror = function() {
            Toast.error('이미지 업로드 중 오류가 발생했습니다.');
        };

        reader.readAsDataURL(file);
    });
}

// 후기 등록 폼 제출
document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 데이터 수집
            const carBrand = document.getElementById('carBrand').value;
            const carName = document.getElementById('carName').value;
            const customerName = document.getElementById('customerName').value;
            const rating = parseInt(document.getElementById('rating').value);
            const content = document.getElementById('content').value;
            const image = document.getElementById('reviewImage').value;

            // 유효성 검사
            if (!carBrand || !carName || !customerName || !content) {
                Toast.error('모든 필수 항목을 입력해주세요.');
                return;
            }

            if (rating < 1 || rating > 5) {
                Toast.error('평점은 1~5 사이여야 합니다.');
                return;
            }

            // DB에 추가
            const db = getDB();
            const newId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            const newReview = {
                id: newId,
                carBrand: carBrand,
                carName: carName,
                customerName: customerName,
                rating: rating,
                content: content,
                image: image,
                date: new Date().toISOString().split('T')[0]
            };

            db.reviews.push(newReview);
            saveDB(db);

            // UI 업데이트
            applyFilters();
            updateStats();
            closeAddReviewModal();

            Toast.success('출고 후기가 등록되었습니다!');
        });
    }
});

// ==========================================
// 후기 수정 모달
// ==========================================

let editSelectedRating = 5;

function openEditReviewModal(id) {
    const db = getDB();
    const review = db.reviews.find(r => r.id === id);

    if (!review) {
        Toast.error('후기를 찾을 수 없습니다.');
        return;
    }

    // 폼에 데이터 채우기
    document.getElementById('editReviewId').value = review.id;
    document.getElementById('editCarBrand').value = review.carBrand;
    document.getElementById('editCarName').value = review.carName;
    document.getElementById('editCustomerName').value = review.customerName;
    document.getElementById('editRating').value = review.rating;
    document.getElementById('editContent').value = review.content;
    document.getElementById('editReviewImage').value = review.image || '';

    // 별점 설정
    editSelectedRating = review.rating;

    // 이미지 미리보기
    if (review.image) {
        const previewImg = document.getElementById('editPreviewImg');
        const imagePreview = document.getElementById('editImagePreview');
        previewImg.src = review.image;
        imagePreview.style.display = 'block';
    }

    // 모달 표시
    document.getElementById('editReviewModal').classList.add('active');
    setupEditRatingInput();
    setupEditImageUpload();
}

function closeEditReviewModal() {
    document.getElementById('editReviewModal').classList.remove('active');
    document.getElementById('editReviewForm').reset();
    editSelectedRating = 5;
    const imagePreview = document.getElementById('editImagePreview');
    if (imagePreview) imagePreview.style.display = 'none';
}

// 수정용 평점 입력 설정
function setupEditRatingInput() {
    const ratingInput = document.getElementById('editRatingInput');
    const stars = ratingInput.querySelectorAll('i');

    // 기존 이벤트 리스너 제거를 위해 클론
    const newRatingInput = ratingInput.cloneNode(true);
    ratingInput.parentNode.replaceChild(newRatingInput, ratingInput);

    const newStars = newRatingInput.querySelectorAll('i');

    newStars.forEach(star => {
        star.addEventListener('click', function() {
            editSelectedRating = parseInt(this.dataset.rating);
            document.getElementById('editRating').value = editSelectedRating;
            updateEditRatingDisplay();
        });

        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            newStars.forEach((s, idx) => {
                if (idx < hoverRating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });

    newRatingInput.addEventListener('mouseleave', () => {
        updateEditRatingDisplay();
    });

    // 초기 표시
    updateEditRatingDisplay();
}

function updateEditRatingDisplay() {
    const stars = document.querySelectorAll('#editRatingInput i');
    stars.forEach((star, idx) => {
        if (idx < editSelectedRating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// 수정용 이미지 업로드 설정
function setupEditImageUpload() {
    const imageFileInput = document.getElementById('editImageFile');
    const imageInput = document.getElementById('editReviewImage');
    const imagePreview = document.getElementById('editImagePreview');
    const previewImg = document.getElementById('editPreviewImg');

    // 이벤트 리스너 중복 방지
    const newImageFileInput = imageFileInput.cloneNode(true);
    imageFileInput.parentNode.replaceChild(newImageFileInput, imageFileInput);

    newImageFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Toast.error('이미지 파일 크기는 5MB 이하여야 합니다.');
            this.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            Toast.error('이미지 파일만 업로드 가능합니다.');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result;
            imageInput.value = base64;
            previewImg.src = base64;
            imagePreview.style.display = 'block';
            Toast.success('이미지가 업로드되었습니다!');
        };

        reader.onerror = function() {
            Toast.error('이미지 업로드 중 오류가 발생했습니다.');
        };

        reader.readAsDataURL(file);
    });
}

// 후기 수정 폼 제출
document.addEventListener('DOMContentLoaded', function() {
    const editReviewForm = document.getElementById('editReviewForm');
    if (editReviewForm) {
        editReviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 데이터 수집
            const reviewId = document.getElementById('editReviewId').value;
            const carBrand = document.getElementById('editCarBrand').value;
            const carName = document.getElementById('editCarName').value;
            const customerName = document.getElementById('editCustomerName').value;
            const rating = parseInt(document.getElementById('editRating').value);
            const content = document.getElementById('editContent').value;
            const image = document.getElementById('editReviewImage').value;

            // 유효성 검사
            if (!carBrand || !carName || !customerName || !content) {
                Toast.error('모든 필수 항목을 입력해주세요.');
                return;
            }

            if (rating < 1 || rating > 5) {
                Toast.error('평점은 1~5 사이여야 합니다.');
                return;
            }

            // DB에서 후기 찾아서 업데이트
            const db = getDB();
            const reviewIndex = db.reviews.findIndex(r => r.id === reviewId);

            if (reviewIndex === -1) {
                Toast.error('후기를 찾을 수 없습니다.');
                return;
            }

            // 업데이트 (날짜는 유지)
            const originalDate = db.reviews[reviewIndex].date;
            db.reviews[reviewIndex] = {
                id: reviewId,
                carBrand: carBrand,
                carName: carName,
                customerName: customerName,
                rating: rating,
                content: content,
                image: image,
                date: originalDate
            };

            saveDB(db);

            // UI 업데이트
            applyFilters();
            updateStats();
            closeEditReviewModal();

            Toast.success('출고 후기가 수정되었습니다!');
        });
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    renderReviews();

    // 검색 및 필터 이벤트 리스너
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const ratingFilter = document.getElementById('ratingFilter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (brandFilter) {
        brandFilter.addEventListener('change', applyFilters);
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('change', applyFilters);
    }
});
