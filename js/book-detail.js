//hiện thị thông tin sách
let currentBook = null
document.addEventListener("DOMContentLoaded", function() {
    // 1. Lấy mã sách (ID) từ thanh địa chỉ URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const token = localStorage.getItem('jwtToken');

    if (!bookId) {
        alert("Không tìm thấy mã sách!");
        window.location.href = "home.html";
        return;
    }

    // 2. Gọi API lấy thông tin chi tiết sách

    fetch(`http://localhost:8080/api/books/${bookId}`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể tải thông tin sách!");
        return res.json();
    })
    .then(book => {
        // Đổ dữ liệu vào giao diện người dùng
        currentBook = book
        if(document.getElementById('detail-title')) 
            document.getElementById('detail-title').innerText = book.title;
        
        if(document.getElementById('detail-author'))
            document.getElementById('detail-author').innerText = book.authorName;
        
        if(document.getElementById('detail-date'))
            document.getElementById('detail-date').innerText = new Date(book.createdAt).toLocaleDateString('vi-VN');
        
        if(document.getElementById('detail-description'))
            document.getElementById('detail-description').innerText = book.description || "Cuốn sách này chưa có mô tả.";
        
        if(document.getElementById('detail-cover'))
            document.getElementById('detail-cover').src = book.coverImage;

        // Hiển thị thể loại
        const categoryNames = book.categories.map(c => c.categoryName).join(", ");
        if(document.getElementById('detail-categories'))
            document.getElementById('detail-categories').innerText = categoryNames;
    })
    .catch(err => {
        console.error("❌ Lỗi load chi tiết sách:", err);
        alert("Lỗi: " + err.message);
    });
});

// PHẦN XỬ LÝ ĐỌC SÁCH PDF
const btnRead = document.getElementById('btn-read-now'); // Nút "Đọc ngay"
const readModal = document.getElementById('read-modal'); // Cái Modal hiện lên
const pdfFrame = document.getElementById('pdf-frame');     // Cái thẻ iframe chứa PDF
const btnCloseRead = document.getElementById('btn-close-read'); // Nút X đóng modal

if (btnRead) {
    btnRead.onclick = () => {
        if(isLogin){
            if(currentBook.type=="VIP" && !isVip) {
                showToast("Vui lòng đăng ký VIP để đọc sách!", "warning")
                return
            }
            if (currentBook.fileUrl) {
                // Ép sang https để tránh lỗi trình duyệt
                let secureUrl = currentBook.fileUrl.replace("http://", "https://");
                
                // Hiện Modal
                readModal.classList.remove('hidden');
                
                // Dùng Google Docs Viewer để đọc PDF mượt hơn
                pdfFrame.src = `https://docs.google.com/gview?url=${encodeURIComponent(secureUrl)}&embedded=true`;
            } else {
                alert("File sách hiện chưa khả dụng!");
            }
        }
        else {
            showToast("Vui lòng đăng nhập để đọc sách!", "warning")
            return
        }
    };
}

// Đóng modal đọc sách
if (btnCloseRead) {
    btnCloseRead.onclick = () => {
        readModal.classList.add('hidden');
        pdfFrame.src = ""; // Dừng tải PDF khi đóng
    };
}