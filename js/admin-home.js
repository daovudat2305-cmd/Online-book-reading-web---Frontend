document.addEventListener("DOMContentLoaded", function() {

    const btnSearch = document.getElementById("btn-search");
    const emptyState = document.getElementById("empty-state");
    const searchResults = document.getElementById("search-results");
    const bookGridContainer = document.getElementById("book-grid-container");
    const searchInput = document.querySelector('input[type="text"]'); 
    const filterPending = document.getElementById('filter-pending');

    // 1. XỬ LÝ NÚT TÌM KIẾM THÔNG MINH

    if(btnSearch) { 
        btnSearch.addEventListener("click", function() {
            const query = searchInput.value.trim().toLowerCase();
            
            emptyState.classList.add("hidden");
            searchResults.classList.remove("hidden");

            // Nếu ô tìm kiếm trống -> Hiện tất cả sách đã duyệt
            if (query === "") {
                loadApprovedBooks();
                if(filterPending) filterPending.checked = false; // Bỏ tích chờ duyệt nếu đang tích
            } else {
                // Nếu có nhập chữ -> Gọi API lấy sách rồi lọc theo tên
                searchBooksLocally(query);
            }
        });
    }


    // 2. XỬ LÝ CHECKBOX LỌC SÁCH CHỜ DUYỆT

    if(filterPending) {
        filterPending.addEventListener('change', function() {
            if (this.checked) {
                loadPendingBooks();
            } else {
                loadApprovedBooks(); // Bỏ tích thì quay về hiện sách đã duyệt
            }
        });
    }
    // 3. HÀM LẤY SÁCH CHỜ DUYỆT (Status = 0)

    function loadPendingBooks() {
        fetchAPI('http://localhost:8080/api/admin/books/pending', true);
    }

    // 4. HÀM LẤY SÁCH ĐÃ DUYỆT (Status = 1)

    function loadApprovedBooks() {
        fetchAPI('http://localhost:8080/api/admin/books/approved', false);
    }

    // 5. HÀM TÌM KIẾM (Lọc dữ liệu tại chỗ)
   
    function searchBooksLocally(query) {
        const token = localStorage.getItem('jwtToken');
        fetch('http://localhost:8080/api/admin/books/approved', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(books => {
            const filtered = books.filter(b => b.title.toLowerCase().includes(query));
            renderBooks(filtered, false);
        });
    }

    // 6. HÀM DÙNG CHUNG ĐỂ GỌI API & VẼ GIAO DIỆN

    function fetchAPI(url, isPending) {
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
            renderBooks(books, isPending);
        })
        .catch(error => {
            bookGridContainer.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">Lỗi: ${error.message}</p>`;
        });
    }

    function renderBooks(books, isPending) {
        bookGridContainer.innerHTML = ''; 

        if (books.length === 0) {
            bookGridContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 font-bold">Không tìm thấy cuốn sách nào!</p>';
            return;
        }

        books.forEach(book => {
            const badge = isPending ? `<span class="absolute px-2 py-1 text-xs font-bold bg-yellow-400 rounded top-2 right-2">Chờ duyệt</span>` : '';
            const link = isPending ? `admin-approve-book.html?id=${book.bookId}` : `admin-book-detail.html?id=${book.bookId}`;

            const bookHtml = `
                <a href="${link}" class="relative flex flex-col items-center block cursor-pointer group">
                    ${badge}
                    <img src="${book.coverImage}" alt="Bìa" class="w-full aspect-[2/3] object-cover bg-gray-200 group-hover:shadow-lg transition duration-300 rounded-md">
                    <span class="mt-3 text-sm font-bold text-n-800 group-hover:text-blue-500 transition text-center line-clamp-2">${book.title}</span>
                    <span class="text-xs text-gray-500 mt-1">Tác giả: ${book.authorName}</span>
                </a>
            `;
            bookGridContainer.innerHTML += bookHtml;
        });
    }

    // Tự động load sách đã duyệt khi vừa mở trang
    loadApprovedBooks();

});