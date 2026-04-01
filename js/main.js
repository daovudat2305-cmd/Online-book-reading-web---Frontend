function showToast(message, type="success") {
    const container = document.getElementById('toast-container')
    // Kiểm tra nếu trang hiện tại có container thì mới chạy tiếp
    if(!container) return; 

    const toast = document.createElement('div')

    let bgColor = ""
    if(type === 'success') bgColor = "bg-success"
    else if(type === 'error') bgColor = "bg-error"
    else if(type === 'warning') bgColor = "bg-warning"

    toast.className = `${bgColor} text-n-800 px-4 py-2 rounded-lg shadow-lg transition duration-300 opacity-0 translate-x-10`
    toast.innerText = message

    container.appendChild(toast)

    // hiệu ứng hiện
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-x-10')
    }, 100)

    // tự ẩn sau 3s
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-x-10");
        setTimeout(() => toast.remove(), 300);
    }, 3000)
}

function requireLogin() {
    // Lấy trạng thái từ Token thật trong localStorage
    const isLogin = localStorage.getItem('jwtToken') ? true : false; 
    if(!isLogin) {
        showToast("Vui lòng đăng nhập!", "warning")
        return false;
    }
    return true
}

// Xử lý chuyển trang cho Sidebar (Sửa lỗi goTo is not defined)
function goTo(url) {
    window.location.href = url;
}

// KIỂM TRA NÚT TRƯỚC KHI GÁN SỰ KIỆN (Để tránh lỗi ở trang Home)
// Tui bọc vào DOMContentLoaded để đảm bảo HTML đã load xong mới tìm nút
document.addEventListener("DOMContentLoaded", function() {
    const readBtn = document.getElementById("read-btn");
    if (readBtn) {
        readBtn.addEventListener("click", () => {
            if (!requireLogin()) return;
            showToast("Chúc bạn đọc sách vui vẻ 📚", "success");
        });
    }

    const likeBtn = document.getElementById("like-btn");
    if (likeBtn) {
        likeBtn.addEventListener("click", () => {
            if (!requireLogin()) return;
        });
    }

    const commentBtn = document.getElementById("comment-btn");
    if (commentBtn) {
        commentBtn.addEventListener("click", () => {
            if (!requireLogin()) return;
        });
    }
});