//nếu chưa đăng nhập thì hiển thị nút đăng nhập / đăng ký
document.addEventListener('DOMContentLoaded', function(){
    checkLoginState()
})

function checkLoginState() {
    // đọc token
    const token = localStorage.getItem('jwtToken')
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    
    const guestMenu = document.getElementById('guest-menu')
    const userMenu = document.getElementById('user-menu')

    if(token) {
        //nếu có
        guestMenu.style.display = 'none' 
        userMenu.style.display = 'flex'
        document.getElementById('display-username').innerText = username
        document.getElementById('profileBtn').href = role == "USER" ? "profile.html" : "profile-author.html"
        loadAvatar()
        
        // ✨ MỚI: Nếu đã đăng nhập thì mới tải danh sách sách
        loadBooks()
    }
    else {
        guestMenu.style.display = 'block'
        userMenu.style.display = 'none'
        
        // (Tùy chọn) Nếu chưa đăng nhập có thể hiện thông báo hoặc ẩn phần danh sách sách
        const bookGrid = document.getElementById('book-grid');
        if(bookGrid) bookGrid.innerHTML = '<p class="text-center w-full py-10 text-gray-500">Vui lòng đăng nhập để xem danh sách sách.</p>';
    }
}

// Hàm xử lý khi bấm Đăng xuất
function logout() {
    // Chỉ cần xóa Token khỏi LocalStorage
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    
    // Tải lại trang chủ để giao diện cập nhật lại thành nút Đăng nhập
    window.location.reload()
}


// click vào phần avatar
const avatarBtn = document.getElementById("avatarBtn")
const avatarMenu = document.getElementById("avatarMenu")

// Kiểm tra sự tồn tại trước khi add listener để tránh lỗi console
if(avatarBtn && avatarMenu) {
    avatarBtn.addEventListener("click", () => {
        avatarMenu.classList.toggle("hidden")
    })

    // click ra ngoài thì đóng
    document.addEventListener("click", (e) => {
        if (!avatarBtn.contains(e.target) && !avatarMenu.contains(e.target)) {
            avatarMenu.classList.add("hidden")
        }
    })
}

//hiển thị avatar
const API_URL = "http://localhost:8080/api/users"
const token = localStorage.getItem('jwtToken')
function loadAvatar() {
    // gọi API
    fetch(`${API_URL}/myInfo`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    })
    .then(async response => {
        if(!response.ok) {
            const errData = await response.json();
            const errMessage = errData.error || JSON.stringify(errData)
            throw new Error(errMessage || "Có lỗi xảy ra ở máy chủ")
        }
        return response.json()
    })
    .then(data => {
        const avatar = document.getElementById('avatarPreview')
        if(avatar) avatar.src = data.avatar == null ? "../assets/avatar.jpg" : data.avatar
    })
    .catch(error => {
        // alert(error.message) // Tắt alert này để tránh phiền người dùng khi token hết hạn
        console.error('Error: ', error)
    })
}

/// PHẦN QUẢN LÝ SÁCH VÀ TÌM KIẾM

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