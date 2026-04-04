// 1. Biến toàn cục để quản lý trạng thái
let currentSearchKeyword = '';
let currentPage = 0;
const pageSize = 20;

// 2. Hàm gọi API duy nhất (Dùng chung cho Load/Search/Phân trang)
function loadBooks(page = 0, keyword = '') {
    currentPage = page;
    currentSearchKeyword = keyword;
    
    console.log(`📚 Đang tải sách trang ${page}, từ khóa: "${keyword}"`);

    // categories và type để trống thì Backend tự hiểu là lấy tất cả sách đã duyệt
    const safeKeyword = encodeURIComponent(keyword);
    const apiUrl = `http://localhost:8080/api/books/filter?keyword=${safeKeyword}&page=${page}&size=${pageSize}&sort=latest`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Đảm bảo lấy token từ localStorage
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Lỗi Server hoặc sai đường dẫn API");
        return res.json();
    })
    .then(data => {
        // data lúc này là Page<Book>
        renderBooks(data.content); 
        renderPagination(data.totalPages, data.number); 
    })
    .catch(err => {
        console.error("❌ Lỗi load sách:", err);
        renderBooks([]); // Hiện thông báo không tìm thấy
    });
}

// 3. HÀM VẼ NÚT PHÂN TRANG (Giữ nguyên logic nhưng dùng loadBooks mới)
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return; 

    // Nút Trước
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Trước';
    prevBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-p-500 hover:bg-p-100'}`;
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => { loadBooks(currentPage - 1, currentSearchKeyword); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    paginationContainer.appendChild(prevBtn);

    // Các nút số
    for (let i = 0; i < totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i + 1; 
        pageBtn.className = i === currentPage ? 'px-4 py-2 border rounded-lg bg-p-400 text-white font-bold shadow-md' : 'px-4 py-2 border rounded-lg bg-white text-n-800 hover:bg-p-100 transition';
        pageBtn.onclick = () => { loadBooks(i, currentSearchKeyword); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        paginationContainer.appendChild(pageBtn);
    }

    // Nút Sau
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'Sau <i class="fa-solid fa-chevron-right"></i>';
    nextBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-p-500 hover:bg-p-100'}`;
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.onclick = () => { loadBooks(currentPage + 1, currentSearchKeyword); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    paginationContainer.appendChild(nextBtn);
}

// 4. Bắt sự kiện ô tìm kiếm (Giữ nguyên logic Debounce)
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // BỎ HẾT setTimeout VÀ clearTimeout
            currentSearchKeyword = this.value.trim();
            currentPage = 0; // Luôn về trang 0 khi tìm kiếm mới
            loadBooks(0, currentSearchKeyword); // Gọi API ngay lập tức
        });
    }
});

// Chạy lần đầu
loadBooks();
// 5. Hàm chuyên làm nhiệm vụ vẽ sách ra HTML
function renderBooks(booksToRender) {
    const bookGrid = document.getElementById('book-grid');
    if (!bookGrid) return;
    
    bookGrid.innerHTML = ''; // Xóa danh sách cũ

    // Nếu không có sách nào trả về
    if (!booksToRender || booksToRender.length === 0) {
        bookGrid.innerHTML = '<p class="text-center w-full col-span-full mt-10 text-gray-500">Không tìm thấy cuốn sách nào phù hợp.</p>';
        return;
    }

    // Lặp qua danh sách sách và tạo HTML cho từng cuốn
    booksToRender.forEach(book => {
        const vipBadge = (book.type && book.type.trim().toUpperCase() === 'VIP') 
            ? `<span class="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">VIP</span>` 
            : '';
            
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
                <p class="text-xs text-gray-500">${book.authorName || 'Ẩn danh'}</p>
            </div>
        `;
        bookGrid.innerHTML += bookItem;
    });
}