document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const token = localStorage.getItem('jwtToken');

    if (!bookId) {
        alert("Không tìm thấy ID sách!");
        window.location.href = "admin-home.html";
        return;
    }

    // 1. Khai báo sẵn các biến cho Modal Đọc sách và Modal Từ chối
    const readModal = document.getElementById('read-modal');
    const pdfFrame = document.getElementById('pdf-frame');
    const btnCloseRead = document.getElementById('btn-close-read');

    const btnReject = document.getElementById('btn-reject');
    const rejectModal = document.getElementById('reject-modal');
    const btnCloseReject = document.getElementById('btn-close-reject');
    const btnCancelReject = document.getElementById('btn-cancel-reject');
    const btnConfirmReject = document.getElementById('btn-confirm-reject');
    const reasonInput = document.getElementById('reject-reason-input');

    // Lấy thông tin chi tiết sách để hiển thị
    fetch(`http://localhost:8080/api/admin/books/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(books => {
        const book = books.find(b => b.bookId === bookId);
        if (book) {
            document.getElementById('book-title').innerText = book.title;
            document.getElementById('book-author').innerText = "Tác giả: " + book.authorName;
            document.getElementById('book-pages').innerText = "Số trang: " + (book.totalPages || 0);
            document.getElementById('book-type').innerText = "Loại sách: " + book.type;
            
            // XỬ LÝ THỂ LOẠI 
            const categoriesElement = document.getElementById('book-categories');
            if (book.categories && book.categories.length > 0) {
                const categoryNames = book.categories.map(c => c.categoryName).join(", ");
                categoriesElement.innerText = "Thể loại: " + categoryNames; 
            } else {
                categoriesElement.innerText = "Thể loại: Chưa phân loại"; 
            }
            
            document.getElementById('book-description').innerText = book.description || "Không có mô tả.";
            document.getElementById('book-cover-container').innerHTML = `<img src="${book.coverImage}" class="w-full aspect-[2/3] object-cover shadow-md rounded">`;
            
            // 2. XỬ LÝ NÚT ĐỌC THỬ PDF (MỞ MODAL)
            const btnRead = document.getElementById('btn-read');
            if (btnRead) {
                btnRead.onclick = () => {
                    if (book.fileUrl) {
                        // Ép sang HTTPS và mở Google Docs Viewer
                        let secureUrl = book.fileUrl.replace("http://", "https://");
                        document.getElementById('read-modal-title').innerText = "Đọc thử: " + book.title;
                        readModal.classList.remove('hidden');
                        
                        const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(secureUrl)}&embedded=true`;
                        pdfFrame.src = googleViewerUrl; 
                    } else {
                        alert("Sách này chưa có file PDF để đọc thử!");
                    }
                };
            }
        }
    });

    // 3. XỬ LÝ NÚT X ĐỂ ĐÓNG MODAL ĐỌC SÁCH
    if (btnCloseRead) {
        btnCloseRead.onclick = () => {
            readModal.classList.add('hidden');
            pdfFrame.src = ""; // Ngắt link tải file khi đóng
        };
    }

    // 4. BẤM NÚT ĐỒNG Ý DUYỆT
    document.getElementById('btn-approve').onclick = function() {
        if(confirm("Bạn muốn duyệt cuốn sách này chứ?")) {
            fetch(`http://localhost:8080/api/admin/books/${bookId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(() => {
                alert("Duyệt thành công!");
                window.location.href = "admin-home.html";
            });
        }
    };


    // 5. XỬ LÝ MODAL TỪ CHỐI SÁCH


    // Mở Modal từ chối
    if (btnReject) {
        btnReject.onclick = function() {
            reasonInput.value = ""; // Xóa trắng ô nhập cũ
            rejectModal.classList.remove('hidden');
        };
    }

    // Hàm đóng Modal từ chối
    function closeRejectModal() {
        rejectModal.classList.add('hidden');
    }
    
    // Gắn sự kiện đóng modal
    if (btnCloseReject) btnCloseReject.onclick = closeRejectModal;
    if (btnCancelReject) btnCancelReject.onclick = closeRejectModal;

    // Khi bấm "Xác nhận từ chối" -> Gọi API
    if (btnConfirmReject) {
        btnConfirmReject.onclick = async function() {
            const reason = reasonInput.value.trim();
            
            if (!reason) {
                alert("Bạn bắt buộc phải nhập lý do từ chối!");
                reasonInput.focus();
                return;
            }

            try {
                // Đổi trạng thái nút để tránh spam click
                btnConfirmReject.innerText = "Đang xử lý...";
                btnConfirmReject.disabled = true;

                const response = await fetch(`http://localhost:8080/api/admin/books/${bookId}/reject`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' // Bắt buộc phải có để gửi JSON
                    },
                    body: JSON.stringify({
                        reason: reason // Gửi lý do lên cho Backend
                    })
                });

                if (response.ok) {
                    alert("Đã từ chối sách thành công!");
                    window.location.href = "admin-home.html"; // Đá về trang chủ admin
                } else {
                    const err = await response.json();
                    alert("Lỗi: " + (err.message || "Không thể từ chối"));
                }
            } catch (error) {
                console.error("Lỗi gọi API từ chối:", error);
                alert("Có lỗi kết nối đến máy chủ!");
            } finally {
                // Trả lại trạng thái nút ban đầu
                btnConfirmReject.innerText = "Xác nhận từ chối";
                btnConfirmReject.disabled = false;
                closeRejectModal();
            }
        };
    }
});