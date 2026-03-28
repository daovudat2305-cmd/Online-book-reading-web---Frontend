const menuBtn = document.querySelectorAll(".menu-btn")
const tabs = document.querySelectorAll(".tab")

menuBtn.forEach(btn => {

    btn.addEventListener("click", () => {

        // đổi active menu
        menuBtn.forEach(b => b.classList.remove("menu-btn-active"))
        btn.classList.add("menu-btn-active")

        // lấy id tab
        const tabId = btn.dataset.tab

        // ẩn tất cả tab
        tabs.forEach(tab => {
            tab.classList.add("hidden")
        })

        // hiện tab được chọn
        document.getElementById(tabId).classList.remove("hidden")

    })

})

const API_URL = "http://localhost:8080/api/users"
const token = localStorage.getItem('jwtToken')
// hiện thị thông tin
function loadInfo() {
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
        const username = document.getElementById('username')
        username.value = data.username

        const email = document.getElementById('email')
        email.value = data.email

        const fullName = document.getElementById('fullName')
        fullName.value = data.fullName == null ? "" : data.fullName

        const role = document.getElementById('role')
        role.value = data.role == "USER" ? "Người dùng" : "Tác giả"

        const gender = document.getElementById('gender')
        gender.value = data.gender == null ? "Khác" : data.gender

        const avatar = document.getElementById('avatar')
        avatar.src = data.avatar

        if(data.dob != null) {
            document.getElementById('dob').value = data.dob
        }

        if(document.getElementById('stk')) {
            document.getElementById('stk').value = data.bankAccount
        }
    })
    .catch(error => {
        alert(error.message)
        console.error('Error: ', error)
    })
}

loadInfo()


// cập nhật thông tin
document.getElementById('saveInfo').addEventListener('click', function(event) {
    event.preventDefault() //ngăn load lại trang

    // lấy giá trị từ các ô input
    const fullNameValue = document.getElementById('fullName').value
    const dobValue = document.getElementById('dob').value
    const genderValue = document.getElementById('gender').value

    //gọi API
    fetch(`${API_URL}/myInfo`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullName: fullNameValue,
            dob: dobValue,
            gender: genderValue
        })
    })
    .then(async response => {
        if (!response.ok) {
            // Cố gắng đọc nội dung lỗi từ server trả về
            const errData = await response.json().catch(() => ({}))
            const errMessage = errData.error || errData.message || "Có lỗi xảy ra khi cập nhật"
            throw new Error(errMessage)
        }
        
        return response.json().catch(() => ({}));
    })
    .then(data => {
        showToast(data.message, 'success')
        loadInfo()
    })
    .catch(error => {
        showToast(error.message, 'warning')
        console.error('Error: ', error)
    })
})


// cập nhật avatar
const avatarBtn = document.getElementById("updateAvatarBtn")
const avatarInput = document.getElementById("avatarInput")

avatarBtn.addEventListener("click", () => {
    avatarInput.click()
})

// xử lý khi người dùng chọn xong file
avatarInput.addEventListener('change', async (event) => {
    const file = event.target.files[0]
    
    if (!file) return; // Nếu hủy chọn file thì không làm gì cả

    // gói file vào FormData
    const formData = new FormData()
    formData.append('avatar', file)

    try {
        const response = await fetch(`${API_URL}/uploadAvatar`, { 
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        })

        const data = await response.json()

        if (response.ok) {
            document.getElementById('avatar').src = data.avatarUrl
            
            showToast(data.message, 'success');
        } else {
            throw new Error(data.message || 'Lỗi từ máy chủ')
        }

    } catch (error) {
        console.error('Lỗi upload:', error)
        showToast('Đã có lỗi xảy ra khi cập nhật ảnh đại diện!', 'error');
    } finally {
        // xóa value của thẻ input để có thể chọn lại chính ảnh đó lần sau nếu cần
        avatarInput.value = ''; 
    }
});