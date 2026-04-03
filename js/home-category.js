document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        initHomeFilters();
    }, 500); 
});

function initHomeFilters() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const typeButtons = document.querySelectorAll('.type-filter-btn');
    const sortSelect = document.getElementById('sort-select'); // Nếu ông có ô chọn sắp xếp

    // 1. Sự kiện cho Checkbox thể loại (Chọn nhiều)
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', applyHomeFilters);
    });

// 2. Nút Loại truyện (Tất cả / Miễn phí / VIP)
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // XÓA TRẠNG THÁI CŨ: Bỏ màu đậm của tất cả các nút
            typeButtons.forEach(b => {
                b.classList.remove('bg-p-400', 'text-n-800', 'font-bold', 'shadow-inner', 'border-p-500');
                b.classList.add('bg-white'); // Trả về nền trắng mặc định
            });

            // THÊM TRẠNG THÁI MỚI: Làm nút đang chọn đậm lên
            this.classList.remove('bg-white');
            this.classList.add('bg-p-400', 'font-bold', 'shadow-inner'); 

            // Cập nhật giá trị lọc
            document.getElementById('current-type-filter').value = this.dataset.value;
            applyHomeFilters();
        });
    });

    // 3. Sự kiện sắp xếp (nếu có)
    if (sortSelect) {
        sortSelect.addEventListener('change', applyHomeFilters);
    }
}

function applyHomeFilters() {
    // Kiểm tra xem biến allBooks từ file book.js có tồn tại không
    if (typeof allBooks === 'undefined' || allBooks.length === 0) {
        console.warn("Chưa có dữ liệu sách để lọc.");
        return;
    }

    let filtered = [...allBooks];

    // LỌC THEO NHIỀU THỂ LOẠI 
    const checkedCats = Array.from(document.querySelectorAll('.category-checkbox:checked'))
                             .map(cb => cb.value);

    if (checkedCats.length > 0) {
        filtered = filtered.filter(book => {
            // Sách hiện ra nếu có ÍT NHẤT 1 thể loại nằm trong danh sách đang tích
            return book.categories && book.categories.some(cat => checkedCats.includes(cat.categoryName));
        });
    }

    // LỌC THEO LOẠI TRUYỆN (FREE/VIP) 
    const typeFilter = document.getElementById('current-type-filter')?.value || 'ALL';
    if (typeFilter !== 'ALL') {
        filtered = filtered.filter(book => book.type === typeFilter);
    }

    // SẮP XẾP 
    const sortValue = document.getElementById('sort-select')?.value;
    if (sortValue === 'latest') {
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortValue === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }

    // VẼ LẠI GIAO DIỆN 
    // Gọi hàm renderBooks thần thánh từ file book.js
    if (typeof renderBooks === 'function') {
        renderBooks(filtered);
    }
}