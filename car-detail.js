// Option Toggle Functionality
function toggleOptionMode() {
    const optionList = document.getElementById('optionList');
    const fabText = document.querySelector('.fab-text');
    const fabIcon = document.querySelector('.fab-icon');

    // Toggle visibility
    if (optionList.style.display === 'none') {
        // Open
        optionList.style.display = 'block';
        fabText.textContent = '옵션 수정';
        fabIcon.className = 'fas fa-pen fab-icon';

        // Scroll to option list
        optionList.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        // Close
        optionList.style.display = 'none';
        fabText.textContent = '옵션 추가';
        fabIcon.className = 'fas fa-plus fab-icon';
    }
}

// Option Item Selection
function toggleOption(element, price) {
    element.classList.toggle('selected');

    // Optional: Add logic here to update total rental price
    // updateRentalPrice(price, element.classList.contains('selected'));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Hidden by default (already handled by inline style, but good to ensure)
    const optionList = document.getElementById('optionList');
    if (optionList) optionList.style.display = 'none';
});
