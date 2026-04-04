document.addEventListener("DOMContentLoaded", function() {

    const btnSearch = document.getElementById("btn-search");
    const emptyState = document.getElementById("empty-state");
    const searchResults = document.getElementById("search-results");
    const bookGridContainer = document.getElementById("book-grid-container");
    const searchInput = document.querySelector('input[type="text"]'); 
    const filterPending = document.getElementById('filter-pending'); // Ô checkbox "Chờ duyệt đăng"
    
    // Lấy danh sách các ô Thể loại và ô Sắp xếp (Cập nhật dùng class và name mới)
    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]'); 
    const sortRadios = document.querySelectorAll('input[name="admin-sort"]'); // Lấy các nút radio sắp xếp mới

    // Biến toàn cục lưu trữ data (Nâng cấp thêm biến phân trang)
    let currentBooks = []; 
    let isCurrentPending = false; 
    let currentPage = 0; // Biến lưu trang hiện tại
    const pageSize = 18; // Số lượng sách mỗi trang

    // 1. GẮN SỰ KIỆN CHO CÁC NÚT & CHECKBOX

    // Bấm nút Tìm kiếm (hoặc Enter)
    if(btnSearch) { 
        btnSearch.addEventListener("click", function() {
            emptyState.classList.add("hidden");
            searchResults.classList.remove("hidden");
            currentPage = 0; // Tìm kiếm mới về trang 0
            applyFiltersAndSort(); 
        });
    }
    if(searchInput) {
        // Gõ phát chạy luôn (Tốc độ cũ - không delay)
        searchInput.addEventListener("input", function() {
            if(this.value.trim() !== "") {
                emptyState.classList.add("hidden");
                searchResults.classList.remove("hidden");
            }
            currentPage = 0;
            applyFiltersAndSort();
        });
        
        searchInput.addEventListener("keyup", function(event) {
            if(event.key === "Enter") {
                emptyState.classList.add("hidden");
                searchResults.classList.remove("hidden");
                currentPage = 0;
                applyFiltersAndSort();
            }
        });
    }

    // Tích ô Sách Chờ Duyệt -> Đổi API
    if(filterPending) {
        filterPending.addEventListener('change', function() {
            isCurrentPending = this.checked;
            currentPage = 0; // Đổi trạng thái về trang 0
            applyFiltersAndSort(); // Dùng chung hàm gọi API filter
        });
    }

    // Tích các ô Thể loại -> Gọi API lọc từ Server
    if(categoryCheckboxes) {
        categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                currentPage = 0;
                applyFiltersAndSort();
            });
        });
    }

    // THAY ĐỔI: Gắn sự kiện cho các nút radio sắp xếp (Lượt xem, Ngày cập nhật)
    if(sortRadios) {
        sortRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                currentPage = 0;
                applyFiltersAndSort();
            });
        });
    }

    // 2. HÀM LẤY SÁCH TỪ SERVER (ĐÃ NÂNG CẤP DÙNG API FILTER ĐA NĂNG)

    function fetchBooks(apiUrl) {
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token'); 
        if(!token) {
            alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            return;
        }

        bookGridContainer.innerHTML = '<p class="col-span-full text-center font-bold animate-pulse">Đang tải dữ liệu...</p>';

        console.log("🚀 Admin calling API:", apiUrl);

        fetch(apiUrl, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 403) throw new Error("403 - Lỗi phân quyền Admin");
            if (!response.ok) throw new Error("Lỗi Server " + response.status);
            return response.json();
        })
        .then(data => {
            // data bây giờ là đối tượng Page (Pageable)
            currentBooks = data.content; 
            renderBooks(currentBooks, isCurrentPending);
            // Gọi hàm vẽ phân trang (ông cần thêm 1 div id="pagination-container" ở HTML admin)
            renderPaginationUI(data.totalPages, data.number);
        })
        .catch(error => {
            bookGridContainer.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">Lỗi: ${error.message}</p>`;
        });
    }

    // 3. TỔNG CỤC LỌC VÀ SẮP XẾP (ĐÃ CHUYỂN SANG NỐI CHUỖI API)

    function applyFiltersAndSort() {
        if (emptyState) emptyState.classList.add("hidden");
        if (searchResults) searchResults.classList.remove("hidden");
        // A. Lấy từ khóa TÌM KIẾM (Mã hóa tiếng Việt)
        const query = searchInput ? encodeURIComponent(searchInput.value.trim()) : "";

        // B. Lấy THỂ LOẠI
        const checkedCats = Array.from(categoryCheckboxes)
                                 .filter(cb => cb.checked)
                                 .map(cb => cb.value)
                                 .join(',');

        // C. THAY ĐỔI: Lấy giá trị sắp xếp từ Radio Button được chọn
        const activeSort = document.querySelector('input[name="admin-sort"]:checked');
        const sortValue = activeSort ? activeSort.value : 'createdAt,desc'; // Mặc định là mới nhất
        
        const status = isCurrentPending ? 0 : 1; 

        // D. QUAN TRỌNG: URL khớp với Context Path '/api' và Controller '/admin/books/filter'
        const url = `http://localhost:8080/api/admin/books/filter?keyword=${query}&categories=${checkedCats}&status=${status}&page=${currentPage}&size=${pageSize}&sort=${sortValue}`;
        
        fetchBooks(url);
    }

    // 4. HÀM VẼ GIAO DIỆN (ĐÃ THÊM HUY HIỆU VIP)

    function renderBooks(books, isPending) {
        bookGridContainer.innerHTML = ''; 

        if (!books || books.length === 0) {
            bookGridContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 font-bold mt-10">Không tìm thấy cuốn sách nào phù hợp với bộ lọc!</p>';
            return;
        }

        books.forEach(book => {
            // 1. Huy hiệu Chờ duyệt (Góc PHẢI)
            const pendingBadge = isPending 
                ? `<span class="absolute px-2 py-1 text-xs font-bold bg-yellow-400 rounded top-2 right-2 shadow z-20">Chờ duyệt</span>` 
                : '';

            // 2. Huy hiệu VIP (Góc TRÁI)
            const vipBadge = (book.type && book.type.trim().toUpperCase() === 'VIP') 
                ? `<span class="absolute px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded top-2 left-2 shadow z-20">VIP</span>` 
                : '';

            const link = isPending ? `admin-approve-book.html?id=${book.bookId}` : `admin-book-detail.html?id=${book.bookId}`;

            const bookHtml = `
                <a href="${link}" class="relative flex flex-col items-center block cursor-pointer group">
                    <img src="${book.coverImage || '../assets/book.jpg'}" alt="Bìa" class="w-full aspect-[2/3] object-cover bg-gray-200 group-hover:shadow-lg transition duration-300 rounded-md">
                    ${pendingBadge}
                    ${vipBadge}
                    <span class="mt-3 text-sm font-bold text-n-800 group-hover:text-blue-500 transition text-center line-clamp-2">${book.title}</span>
                    <span class="text-xs text-gray-500 mt-1">Tác giả: ${book.authorName || 'Ẩn danh'}</span>
                </a>
            `;
            bookGridContainer.innerHTML += bookHtml;
        });
    }

    // --- HÀM PHÂN TRANG CHO ADMIN (ĐÃ NÂNG CẤP TRƯỚC/SAU) ---
    function renderPaginationUI(totalPages, page) {
        const container = document.getElementById('pagination-container');
        if(!container) {
            console.error("Lỗi: Không tìm thấy <div id='pagination-container'> trong HTML!");
            return;
        }
        
        container.innerHTML = ''; // Xóa sạch dữ liệu cũ
        if(totalPages <= 1) return; // Chỉ có 1 trang thì ẩn luôn phân trang

        // 1. Nút "Trước"
        const prevBtn = document.createElement('button');
        prevBtn.innerText = 'Trước';
        prevBtn.className = `px-3 py-1 border mx-1 rounded bg-white text-gray-700 hover:bg-blue-50 transition ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
        prevBtn.disabled = page === 0;
        prevBtn.onclick = () => {
            if (page > 0) {
                currentPage = page - 1;
                applyFiltersAndSort();
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        };
        container.appendChild(prevBtn);

        // 2. Các nút số trang
        for(let i = 0; i < totalPages; i++) {
            const btn = document.createElement('button');
            btn.innerText = i + 1;
            // Highlight trang hiện tại bằng màu xanh đậm
            btn.className = `px-3 py-1 border mx-1 rounded transition ${i === page ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-blue-50 cursor-pointer'}`;
            btn.onclick = () => {
                currentPage = i;
                applyFiltersAndSort();
                window.scrollTo({top: 0, behavior: 'smooth'});
            };
            container.appendChild(btn);
        }

        // 3. Nút "Sau"
        const nextBtn = document.createElement('button');
        nextBtn.innerText = 'Sau';
        nextBtn.className = `px-3 py-1 border mx-1 rounded bg-white text-gray-700 hover:bg-blue-50 transition ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
        nextBtn.disabled = page === totalPages - 1;
        nextBtn.onclick = () => {
            if (page < totalPages - 1) {
                currentPage = page + 1;
                applyFiltersAndSort();
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        };
        container.appendChild(nextBtn);
    }
    
    // Mở trang lên là Auto lấy sách đã duyệt trước
    applyFiltersAndSort();

});