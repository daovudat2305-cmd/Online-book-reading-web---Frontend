document.addEventListener("DOMContentLoaded", function() {

    const btnSearch = document.getElementById("btn-search");
    const emptyState = document.getElementById("empty-state");
    const searchResults = document.getElementById("search-results");
    const bookGridContainer = document.getElementById("book-grid-container");
    const searchInput = document.querySelector('input[type="text"]'); 
    const filterPending = document.getElementById('filter-pending'); // Ô checkbox "Chờ duyệt đăng"
    
    // Lấy danh sách các ô Thể loại và ô Sắp xếp

    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]'); 
    const sortDateCheckbox = document.getElementById('sort-date'); // LƯU Ý BÊN HTML: Đặt id này cho ô Ngày cập nhật

    // Biến toàn cục lưu trữ data
    let currentBooks = []; 
    let isCurrentPending = false; 

    // 1. GẮN SỰ KIỆN CHO CÁC NÚT & CHECKBOX


    // Bấm nút Tìm kiếm (hoặc Enter)
    if(btnSearch) { 
        btnSearch.addEventListener("click", function() {
            emptyState.classList.add("hidden");
            searchResults.classList.remove("hidden");
            applyFiltersAndSort(); 
        });
    }
    if(searchInput) {
        searchInput.addEventListener("keyup", function(event) {
            if(event.key === "Enter") {
                emptyState.classList.add("hidden");
                searchResults.classList.remove("hidden");
                applyFiltersAndSort();
            }
        });
    }

    // Tích ô Sách Chờ Duyệt -> Đổi API
    if(filterPending) {
        filterPending.addEventListener('change', function() {
            isCurrentPending = this.checked;
            if (isCurrentPending) {
                fetchBooks('http://localhost:8080/api/admin/books/pending');
            } else {
                fetchBooks('http://localhost:8080/api/admin/books/approved');
            }
        });
    }

    // Tích các ô Thể loại & Sắp xếp ngày -> Chỉ cần Lọc lại, không gọi API
    if(categoryCheckboxes) {
        categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', applyFiltersAndSort);
        });
    }
    if(sortDateCheckbox) {
        sortDateCheckbox.addEventListener('change', applyFiltersAndSort);
    }



    // 2. HÀM LẤY SÁCH TỪ SERVER LƯU VÀO BIẾN

    function fetchBooks(url) {
        const token = localStorage.getItem('jwtToken'); 
        if(!token) {
            alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            return;
        }

        bookGridContainer.innerHTML = '<p class="col-span-full text-center font-bold animate-pulse">Đang tải dữ liệu...</p>';

        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) throw new Error("Lỗi Server");
            return response.json();
        })
        .then(books => {
            currentBooks = books;
            applyFiltersAndSort();
        })
        .catch(error => {
            bookGridContainer.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">Lỗi: ${error.message}</p>`;
        });
    }



    // 3. TỔNG CỤC LỌC VÀ SẮP XẾP

    function applyFiltersAndSort() {
        let filtered = [...currentBooks]; // Lấy data từ két sắt ra xài

        // A. Lọc theo TÌM KIẾM
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        if (query !== "") {
            filtered = filtered.filter(b => b.title.toLowerCase().includes(query));
        }

        // B. Lọc theo THỂ LOẠI
        if(categoryCheckboxes && categoryCheckboxes.length > 0) {
            // Gom tất cả những ô Thể loại đang được tích
            const checkedCats = Array.from(categoryCheckboxes)
                                     .filter(cb => cb.checked)
                                     .map(cb => cb.value); 
            
            if (checkedCats.length > 0) {
                filtered = filtered.filter(book => {
                    // Cần có mảng categoryName trả về từ DB
                    return book.categories && book.categories.some(cat => checkedCats.includes(cat.categoryName));
                });
            }
        }

        // C. Sắp xếp theo NGÀY CẬP NHẬT (Mới nhất lên đầu)
        if (sortDateCheckbox && sortDateCheckbox.checked) {
            filtered.sort((a, b) => {
                let dateA = new Date(a.createdAt || 0);
                let dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
        }

        renderBooks(filtered, isCurrentPending);
    }



    // 4. HÀM VẼ GIAO DIỆN (ĐÃ THÊM HUY HIỆU VIP)

    function renderBooks(books, isPending) {
        bookGridContainer.innerHTML = ''; 

        if (books.length === 0) {
            bookGridContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 font-bold mt-10">Không tìm thấy cuốn sách nào phù hợp với bộ lọc!</p>';
            return;
        }

        books.forEach(book => {
            // 1. Huy hiệu Chờ duyệt (Góc PHẢI)
            const pendingBadge = isPending 
                ? `<span class="absolute px-2 py-1 text-xs font-bold bg-yellow-400 rounded top-2 right-2 shadow z-20">Chờ duyệt</span>` 
                : '';

            // 2. Huy hiệu VIP (Góc TRÁI) - Thêm .trim() để chống lỗi dư dấu cách từ DB
            const vipBadge = (book.type && book.type.trim().toUpperCase() === 'VIP') 
                ? `<span class="absolute px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded top-2 left-2 shadow z-20">VIP</span>` 
                : '';

            const link = isPending ? `admin-approve-book.html?id=${book.bookId}` : `admin-book-detail.html?id=${book.bookId}`;

            // QUAN TRỌNG: Đặt ${vipBadge} nằm DƯỚI thẻ <img> để nó vẽ đè lên trên bức ảnh
            const bookHtml = `
                <a href="${link}" class="relative flex flex-col items-center block cursor-pointer group">
                    <img src="${book.coverImage}" alt="Bìa" class="w-full aspect-[2/3] object-cover bg-gray-200 group-hover:shadow-lg transition duration-300 rounded-md">
                    ${pendingBadge}
                    ${vipBadge}
                    <span class="mt-3 text-sm font-bold text-n-800 group-hover:text-blue-500 transition text-center line-clamp-2">${book.title}</span>
                    <span class="text-xs text-gray-500 mt-1">Tác giả: ${book.authorName}</span>
                </a>
            `;
            bookGridContainer.innerHTML += bookHtml;
        });
    }
    
    // Mở trang lên là Auto lấy sách đã duyệt trước
    fetchBooks('http://localhost:8080/api/admin/books/approved');

});