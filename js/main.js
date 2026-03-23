function showToast(message, type="success") {
    const container = document.getElementById('toast-container')

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
    const isLogin = false; // lấy từ backend
    if(!isLogin) {
        showToast("Vui lòng đăng nhập!", "warning")
        return false;
    }
    return true
}

document.getElementById("read-btn").addEventListener("click", () => {
    if (!requireLogin()) return;

    showToast("Chúc bạn đọc sách vui vẻ 📚", "success");
});

document.getElementById("like-btn").addEventListener("click", () => {
    if (!requireLogin()) return;

});

document.getElementById("comment-btn").addEventListener("click", () => {
    if (!requireLogin()) return;

});