document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
        initHomeFilters();
        // Vừa vào trang là gọi API lấy sách luôn (Trang 0)
        applyHomeFilters(); 
    }, 500); 
});

function initHomeFilters() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const typeButtons = document.querySelectorAll('.type-filter-btn');
    const sortSelect = document.getElementById('sort-select'); 
    const searchInput = document.getElementById('search-input'); // Ô search trang chủ/thể loại

    // 1. Sự kiện cho Checkbox thể loại
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            currentPage = 0; // Đổi bộ lọc là phải về trang 0
            applyHomeFilters();
        });
    });

    // 2. Nút Loại truyện (Tất cả / Miễn phí / VIP)
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // XÓA TRẠNG THÁI CŨ
            typeButtons.forEach(b => {
                b.classList.remove('bg-p-400', 'text-n-800', 'font-bold', 'shadow-inner', 'border-p-500');
                b.classList.add('bg-white'); 
            });

            // THÊM TRẠNG THÁI MỚI
            this.classList.remove('bg-white');
            this.classList.add('bg-p-400', 'font-bold', 'shadow-inner'); 

            // Cập nhật giá trị lọc và gọi API
            document.getElementById('current-type-filter').value = this.dataset.value;
            
            currentPage = 0; // Đổi bộ lọc là phải về trang 0
            applyHomeFilters();
        });
    });

    // 3. Sự kiện sắp xếp
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentPage = 0; // Đổi sắp xếp cũng về trang 0
            applyHomeFilters();
        });
    }

    // 4. Sự kiện tìm kiếm (Gõ phát chạy luôn - Tốc độ cũ)
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 0; // Tìm kiếm mới luôn về trang 0
            applyHomeFilters();
        });
    }
}

// HÀM NÀY ĐÃ ĐƯỢC NÂNG CẤP THÀNH HÀM GỌI API
function applyHomeFilters() {
    // 1. Thu thập Thể loại
    const checkedCats = Array.from(document.querySelectorAll('.category-checkbox:checked'))
                             .map(cb => cb.value)
                             .join(','); // Ví dụ: "TienHiep,KiemHiep" hoặc "1,2"

    // 2. Thu thập Loại truyện
    const typeFilter = document.getElementById('current-type-filter')?.value || 'ALL';

    // 3. Thu thập Sắp xếp
    const sortValue = document.getElementById('sort-select')?.value || 'newest';

    // 4. (Tùy chọn) Thu thập từ khóa tìm kiếm nếu có ô search ở trang này
    // Sử dụng encodeURIComponent để tránh lỗi 400 khi gõ tiếng Việt có dấu
    const rawKeyword = document.getElementById('search-input')?.value || '';
    const keyword = encodeURIComponent(rawKeyword);

    // 5. NỐI THÀNH URL ĐỂ GỌI BACKEND
    const apiUrl = `http://localhost:8080/api/books/filter?keyword=${keyword}&categories=${checkedCats}&type=${typeFilter}&sort=${sortValue}&page=${currentPage}&size=${pageSize}`;

    console.log("🚀 Đang gọi API:", apiUrl);

    // 6. GỌI API BẰNG FETCH
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi khi tải dữ liệu từ Server");
            return response.json();
        })
        .then(data => {
            // data.content là mảng chứa 12 cuốn sách của trang hiện tại
            if (typeof renderBooks === 'function') {
                renderBooks(data.content);
            }
            
            // Vẽ lại nút phân trang ở dưới đáy
            renderPaginationUI(data.totalPages, currentPage);
        })
        .catch(error => {
            console.error("Lỗi:", error);
            // Tạm thời nếu Backend chưa có API này thì nó sẽ báo lỗi đỏ ở Console, kệ nó nhé!
        });
}

// --- CÁC HÀM XỬ LÝ PHÂN TRANG (Cần có để chuyển trang) ---

function renderPaginationUI(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-container'); 
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = ''; 
    if (totalPages <= 1) return; 

    // Nút Trước
    const prevBtn = `<button class="px-3 py-1 border rounded ${currentPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100'}" ${currentPage === 0 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">< Trước</button>`;
    paginationContainer.innerHTML += prevBtn;

    // Các nút số (1, 2, 3...)
    for (let i = 0; i < totalPages; i++) {
        const activeClass = i === currentPage ? 'bg-blue-500 text-white font-bold' : 'hover:bg-blue-100';
        const pageBtn = `<button class="px-3 py-1 border rounded ${activeClass}" onclick="changePage(${i})">${i + 1}</button>`;
        paginationContainer.innerHTML += pageBtn;
    }

    // Nút Sau
    const nextBtn = `<button class="px-3 py-1 border rounded ${currentPage === totalPages - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100'}" ${currentPage === totalPages - 1 ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Sau ></button>`;
    paginationContainer.innerHTML += nextBtn;
}

function changePage(pageNumber) {
    currentPage = pageNumber; 
    applyHomeFilters(); // Gọi lại API để lấy sách của trang mới
}