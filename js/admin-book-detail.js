document.addEventListener("DOMContentLoaded", function() {
    // 1. Lấy thông tin từ URL và LocalStorage
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const token = localStorage.getItem('jwtToken');

    // Các phần tử giao diện
    const deleteModal = document.getElementById('delete-modal');
    const btnDelete = document.getElementById('btn-delete');
    const btnCancel = document.getElementById('btn-cancel');
    const btnSubmit = document.getElementById('btn-submit');

    if (!bookId) {
        alert("Không tìm thấy mã sách!");
        window.location.href = "admin-home.html";
        return;
    }

    // 2. Tải dữ liệu từ API Admin
    fetch(`http://localhost:8080/api/admin/books/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if(!res.ok) throw new Error("Lỗi xác thực hoặc quyền truy cập (403)");
        return res.json();
    })
    .then(books => {
        // Tìm đúng cuốn sách theo ID trong danh sách trả về
        const book = books.find(b => b.bookId === bookId);
        
        if (!book) {
            alert("Không tìm thấy dữ liệu cho cuốn sách này!");
            window.location.href = "admin-home.html";
            return;
        }

        // --- Đổ dữ liệu vào HTML theo đúng ID---
        document.getElementById('book-title').innerText = book.title;
        document.getElementById('book-author').innerText = "Tác giả: " + book.authorName;
        document.getElementById('book-date').innerText = "Ngày đăng: " + book.createdAt;
        document.getElementById('book-pages').innerText = "Số trang: " + (book.totalPages || 0);
        
        // Hiển thị Loại sách (FREE/VIP)
        document.getElementById('book-type').innerText = "Loại sách: " + book.type;

        // HIỂN THỊ NỘI DUNG GIỚI THIỆU 
        const descriptionEl = document.getElementById('book-description');
        if (book.description && book.description.trim() !== "") {
            descriptionEl.innerText = book.description;
        } else {
            descriptionEl.innerText = "Cuốn sách này chưa có lời giới thiệu.";
            descriptionEl.classList.remove('italic'); // Bỏ in nghiêng nếu không có nội dung
        }

        // Hiển thị Danh sách Thể loại (categories là mảng gửi từ Backend)
        const categoriesSpan = document.getElementById('book-categories');
        if (book.categories && book.categories.length > 0) {
            const categoryNames = book.categories.map(c => c.categoryName).join(", ");
            categoriesSpan.innerText = categoryNames;
        } else {
            categoriesSpan.innerText = "Chưa phân loại";
        }

        // Hiển thị ảnh bìa
        document.getElementById('book-cover-container').innerHTML = 
            `<img src="${book.coverImage}" class="w-full object-contain shadow-md rounded border border-gray-200">`;
        
        
        // 1. Lượt đọc
        if (document.getElementById('book-view')) {
            document.getElementById('book-view').innerText = "Lượt đọc: " + (book.viewCount == null ? 0 : book.viewCount);
        }

        // 2. Lượt yêu thích
        fetch(`http://localhost:8080/api/favorites/${bookId}/count`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (document.getElementById('book-favorites')) {
                document.getElementById('book-favorites').innerText = "Lượt yêu thích: " + (data.favorites || 0);
            }
        })
        .catch(err => console.error("Lỗi lấy lượt thích:", err));

        // 3. Số bình luận
        fetch(`http://localhost:8080/api/comments/${bookId}?page=0&size=1`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (document.getElementById('numberOfComments')) {
                document.getElementById('numberOfComments').innerText = "Số bình luận: " + (data.totalElements || 0);
            }
        })
        .catch(err => console.error("Lỗi lấy bình luận:", err));

        // Nút đọc sách
        // 1. Khai báo các biến cho Modal Đọc Sách
        const readModal = document.getElementById('read-modal');
        const pdfFrame = document.getElementById('pdf-frame');
        const btnCloseRead = document.getElementById('btn-close-read');

        // 2. Xử lý khi bấm nút Đọc sách
        document.getElementById('btn-read').onclick = () => {
            if(book.fileUrl) {
                // TỰ ĐỘNG ÉP SANG HTTPS ĐỂ TRÁNH LỖI BẢO MẬT CỦA TRÌNH DUYỆT
                let secureUrl = book.fileUrl.replace("http://", "https://");
                
                // Hiển thị tên sách lên header của Modal
                document.getElementById('read-modal-title').innerText = book.title;
                
                // Mở Modal và gắn link PDF vào iframe
                readModal.classList.remove('hidden');
                
                // Dùng Google Docs Viewer để đọc PDF trực tiếp trên web
                const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(secureUrl)}&embedded=true`;
                pdfFrame.src = googleViewerUrl;
            } else {
                alert("Sách này chưa có file PDF!");
            }
        };

        // 3. Xử lý khi bấm nút X (Đóng Modal)
        if(btnCloseRead) {
            btnCloseRead.onclick = () => {
                readModal.classList.add('hidden');
                pdfFrame.src = ""; // Xóa src để dừng tải file ngầm
            };
        }
    })
    .catch(err => {
        console.error("Lỗi Fetch:", err);
        alert("Không thể tải thông tin sách. Vui lòng kiểm tra Server!");
    });

    // 3. Xử lý đóng/mở Modal xóa sách
    if(btnDelete) btnDelete.onclick = () => deleteModal.classList.remove('hidden');
    if(btnCancel) btnCancel.onclick = () => {
        deleteModal.classList.add('hidden');
        document.getElementById('delete-reason').value = ''; // Xóa trắng lý do khi hủy
    };

    // 4. XỬ LÝ XÓA SÁCH
    btnSubmit.onclick = function() {
        const reason = document.getElementById('delete-reason').value.trim();
        
        if (!reason) {
            alert("Bạn phải nhập lý do xóa sách!");
            return;
        }

        if (confirm("Hành động này sẽ gỡ sách khỏi trang chủ và gửi lý do cho tác giả. Xác nhận?")) {
            btnSubmit.innerText = "Đang xử lý...";
            btnSubmit.disabled = true;

            fetch(`http://localhost:8080/api/admin/books/${bookId}/delete`, {
                method: 'PUT', // Phải là PUT để cập nhật status = 3
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' // Bắt buộc để gửi JSON body
                },
                body: JSON.stringify({ reason: reason }) // Gửi lý do vào Body
            })
            .then(async res => {
                if(res.ok) {
                    alert("✅ Đã gỡ sách và gửi lý do thành công!");
                    window.location.href = "admin-home.html";
                } else {
                    const errData = await res.json().catch(() => ({}));
                    alert("❌ Lỗi: " + (errData.message || "Bạn không có quyền hoặc hệ thống lỗi."));
                }
            })
            .catch(err => alert("Lỗi kết nối Server!"))
            .finally(() => {
                btnSubmit.innerText = "Gửi & Xóa";
                btnSubmit.disabled = false;
            });
        }
    };
});