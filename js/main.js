// ==========================================
// 1. CÁC HÀM TIỆN ÍCH DÙNG CHUNG (Do ông viết)
// ==========================================
function showToast(message, type="success") {
    const container = document.getElementById('toast-container');
    if(!container) return;

    let bgColor = "";
    if(type === 'success') bgColor = "bg-success";
    else if(type === 'error') bgColor = "bg-error";
    else if(type === 'warning') bgColor = "bg-warning";

    // Fix lỗi: Tui đã thêm dòng tạo element toast vào đây cho ông
    const toast = document.createElement('div');
    toast.className = `${bgColor} text-n-800 px-4 py-2 rounded-lg shadow-lg transition duration-300 opacity-0 translate-x-10`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-x-10');
    }, 100);

    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-x-10");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function requireLogin() {
    const isLogin = localStorage.getItem('jwtToken') ? true : false; 
    if(!isLogin) {
        showToast("Vui lòng đăng nhập!", "warning");
        return false;
    }
    return true;
}

function goTo(url) {
    window.location.href = url;
}


// ==========================================
// 2. LOGIC TÀI KHOẢN & AVATAR (Do bạn ông viết)
// ==========================================
function checkLoginState() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');

    if(token) {
        if(guestMenu) guestMenu.style.display = 'none';
        if(userMenu) userMenu.style.display = 'flex';
        
        const displayUsername = document.getElementById('display-username');
        if(displayUsername) displayUsername.innerText = username;
        
        const profileBtn = document.getElementById('profileBtn');
        if(profileBtn) profileBtn.href = role == "USER" ? "profile.html" : "profile-author.html";
        
        loadAvatar();
    } else {
        if(guestMenu) guestMenu.style.display = 'block';
        if(userMenu) userMenu.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.reload();
}

const API_URL = "http://localhost:8080/api/users";

async function loadAvatar() {
    const token = localStorage.getItem('jwtToken');
    if(!token) return;

    try {
        const response = await fetch(`${API_URL}/myInfo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if(!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Có lỗi xảy ra ở máy chủ");
        }
        
        const data = await response.json();
        const avatarBtn = document.getElementById("avatarBtn");
        const avatar = document.getElementById('avatarPreview');
        
        if(avatar) avatar.src = data.avatar;
        
        if(data.isVip && avatar) {
            avatar.classList.add("border-3", "border-yellow-400");
            if(avatarBtn) avatarBtn.insertAdjacentHTML("beforeend", `<i class="fa-solid fa-crown text-yellow-400"></i>`);
        } else if (avatar) {
            avatar.classList.add("border-3", "border-n-500");
        }
    } catch (error) {
        console.error('Lỗi tải Avatar: ', error);
    }
}


// ==========================================
// 3. KHỞI CHẠY SỰ KIỆN KHI TRANG LOAD XONG (Gộp của cả 2)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
    // Chạy kiểm tra đăng nhập ngay khi vào web
    checkLoginState();

    // Sự kiện mở menu Avatar (Của nhóm)
    const avatarBtn = document.getElementById("avatarBtn");
    const avatarMenu = document.getElementById("avatarMenu");

    if (avatarBtn && avatarMenu) {
        avatarBtn.addEventListener("click", () => {
            avatarMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!avatarBtn.contains(e.target) && !avatarMenu.contains(e.target)) {
                avatarMenu.classList.add("hidden");
            }
        });
    }

    // Sự kiện Nút tương tác sách (Của ông)
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