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
    }
    else {
        guestMenu.style.display = 'block'
        userMenu.style.display = 'none'
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

avatarBtn.addEventListener("click", () => {
    avatarMenu.classList.toggle("hidden")
})

// click ra ngoài thì đóng
document.addEventListener("click", (e) => {
    if (!avatarBtn.contains(e.target) && !avatarMenu.contains(e.target)) {
        avatarMenu.classList.add("hidden")
    }
})

//hiển thị avatar
const API_URL = "http://localhost:8080/api/users"
const token = localStorage.getItem('jwtToken')
async function loadAvatar() {
    try {
        // gọi API
        const response = await fetch(`${API_URL}/myInfo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })

        if(!response.ok) {
            const errData = await response.json();
            const errMessage = errData.error || JSON.stringify(errData)
            throw new Error(errMessage || "Có lỗi xảy ra ở máy chủ")
        }
        //hien thi du lieu
        const data = await response.json()
        const avatarBtn = document.getElementById("avatarBtn")
        const avatar = document.getElementById('avatarPreview')
        avatar.src = data.avatar
        if(data.isVip) {
            avatar.classList.add("border-3", "border-yellow-400")
            avatarBtn.insertAdjacentHTML("beforeend", `<i class="fa-solid fa-crown text-yellow-400"></i>`)
        }
        else {
            avatar.classList.add("border-3", "border-n-500")
        }
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}