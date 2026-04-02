/// xử lý quản lý sách và tìm kiếm
// 1. Biến toàn cục để lưu trữ sách gốc (tránh phải gọi API nhiều lần khi tìm kiếm)
let allBooks = [];
// 2. Hàm gọi API lấy sách từ Server
function loadBooks() {
    const bookGrid = document.getElementById('book-grid');
    if (!bookGrid) return;

    console.log("📚 Đang tải danh sách sách...");

    fetch('http://localhost:8080/api/books/all', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể tải danh sách sách");
        return res.json();
    })
    .then(books => {
        allBooks = books; // Lưu sách vào két sắt để dùng cho tìm kiếm
        renderBooks(allBooks); // Vẽ toàn bộ sách ra màn hình lần đầu tiên
    })
    .catch(err => {
        console.error("❌ Lỗi load sách:", err);
    });
}

// 3. Hàm chuyên làm nhiệm vụ vẽ sách ra HTML
function renderBooks(booksToRender) {
    const bookGrid = document.getElementById('book-grid');
    if (!bookGrid) return;
    
    bookGrid.innerHTML = ''; // Xóa sách cũ đi

    if (booksToRender.length === 0) {
        bookGrid.innerHTML = '<p class="text-center w-full col-span-4 mt-10 text-gray-500">Không tìm thấy cuốn sách nào phù hợp.</p>';
        return;
    }

    booksToRender.forEach(book => {
        const bookItem = `
            <div class="cursor-pointer bg-white p-3 rounded-lg shadow hover:shadow-lg transition group" 
                 onclick="location.href='book-detail.html?id=${book.bookId}'">
                <div class="overflow-hidden rounded-md mb-3">
                    <img src="${book.coverImage}" alt="${book.title}" 
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
    
    if (searchInput) {
        // Dùng 'input' để nó tự động tìm ngay khi vừa gõ phím, không cần bấm Enter
        searchInput.addEventListener('input', function() {
            const keyword = this.value.trim().toLowerCase(); // Lấy chữ người dùng gõ, chuyển thành chữ thường

            // Lọc ra những cuốn sách có Tên hoặc Tác giả chứa từ khóa
            const filteredBooks = allBooks.filter(book => {
                const titleMatch = book.title.toLowerCase().includes(keyword);
                const authorMatch = book.authorName.toLowerCase().includes(keyword);
                return titleMatch || authorMatch;
            });

            // Vẽ lại bảng sách với dữ liệu đã lọc
            renderBooks(filteredBooks);
        });
    }
});

loadBooks()