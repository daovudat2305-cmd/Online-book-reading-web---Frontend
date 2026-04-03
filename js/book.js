// Biến toàn cục để lưu từ khóa tìm kiếm hiện tại
let currentSearchKeyword = '';

// 1. Hàm gọi API lấy sách từ Server (Cập nhật để hỗ trợ tìm kiếm)
function loadBooks(page = 0, keyword = '') {
    console.log(`📚 Đang tải sách trang ${page}, từ khóa: "${keyword}"`);

    // Tạo URL động, nếu có keyword thì gọi API tìm kiếm, không thì gọi API mặc định
    // LƯU Ý: Ông phải nhờ Backend viết thêm API tìm kiếm (xem hướng dẫn ở dưới)
    let apiUrl = `http://localhost:8080/api/books/all?page=${page}&size=20`;
    
    // Nếu có từ khóa, chuyển hướng gọi sang API tìm kiếm của Backend
    if (keyword.trim() !== '') {
         apiUrl = `http://localhost:8080/api/books/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=20`;
    }

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể tải danh sách sách");
        return res.json();
    })
    .then(data => {
        // Vẽ sách và nút phân trang
        renderBooks(data.content); 
        renderPagination(data.totalPages, data.number); 
    })
    .catch(err => {
        console.error("❌ Lỗi load sách:", err);
        renderBooks([]); // Hiện thông báo không tìm thấy nếu lỗi
    });
}

// 2. HÀM VẼ NÚT PHÂN TRANG
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return; 

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Trước';
    prevBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-p-500 hover:bg-p-100'}`;
    prevBtn.disabled = currentPage === 0;
    // Cập nhật sự kiện click: Phải truyền thêm currentSearchKeyword để giữ nguyên bộ lọc khi chuyển trang
    prevBtn.onclick = () => { loadBooks(currentPage - 1, currentSearchKeyword); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    paginationContainer.appendChild(prevBtn);

    for (let i = 0; i < totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i + 1; 
        pageBtn.className = i === currentPage ? 'px-4 py-2 border rounded-lg bg-p-400 text-white font-bold shadow-md' : 'px-4 py-2 border rounded-lg bg-white text-n-800 hover:bg-p-100 transition';
        // Cập nhật sự kiện click
        pageBtn.onclick = () => { loadBooks(i, currentSearchKeyword); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'Sau <i class="fa-solid fa-chevron-right"></i>';
    nextBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-p-500 hover:bg-p-100'}`;
    nextBtn.disabled = currentPage === totalPages - 1;
    // Cập nhật sự kiện click
    nextBtn.onclick = () => { loadBooks(currentPage + 1, currentSearchKeyword); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    paginationContainer.appendChild(nextBtn);
}

// 3. Hàm chuyên làm nhiệm vụ vẽ sách ra HTML
function renderBooks(booksToRender) {
    const bookGrid = document.getElementById('book-grid');
    if (!bookGrid) return;
    
    bookGrid.innerHTML = ''; 

    if (!booksToRender || booksToRender.length === 0) {
        bookGrid.innerHTML = '<p class="text-center w-full col-span-4 mt-10 text-gray-500">Không tìm thấy cuốn sách nào phù hợp.</p>';
        return;
    }

    booksToRender.forEach(book => {
        const vipBadge = (book.type && book.type.trim().toUpperCase() === 'VIP') 
            ? `<span class="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">VIP</span>` 
            : '';
            
        // Chống lỗi ảnh null
        const defaultImage = '../assets/book.jpg';
        const imageSource = book.coverImage ? book.coverImage : defaultImage;

        const bookItem = `
            <div class="cursor-pointer bg-white p-3 rounded-lg shadow hover:shadow-lg transition group relative" 
                 onclick="location.href='book-detail.html?id=${book.bookId}'">
                
                <div class="overflow-hidden rounded-md mb-3 relative">
                    ${vipBadge}
                    
                    <img src="${imageSource}" alt="${book.title}" 
                         onerror="this.onerror=null; this.src='${defaultImage}';"
                         class="w-full h-64 object-cover group-hover:scale-105 transition duration-300">
                </div>
                
                <h3 class="font-bold text-n-800 text-sm line-clamp-2 mb-1">${book.title}</h3>
                <p class="text-xs text-gray-500">${book.authorName}</p>
            </div>
        `;
        bookGrid.innerHTML += bookItem;
    });
}

// 4. Bắt sự kiện khi người dùng gõ vào ô tìm kiếm
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('search-input');
    
    // Tạo một biến timer để dùng kĩ thuật "Debounce" (giảm tải cho Server)
    let searchTimer;

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Xóa hẹn giờ cũ nếu người dùng đang gõ liên tục
            clearTimeout(searchTimer);
            
            // Hẹn giờ 500ms (nửa giây) sau khi ngừng gõ mới gọi API
            searchTimer = setTimeout(() => {
                currentSearchKeyword = this.value.trim();
                // Khi tìm kiếm, luôn phải bắt đầu lại từ trang 0
                loadBooks(0, currentSearchKeyword);
            }, 500); 
        });
    }
});

// Chạy lần đầu khi vào trang
loadBooks();