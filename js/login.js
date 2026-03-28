const API_URL = "http://localhost:8080/api/auth";

// bấm đăng nhập
document.getElementById('btnLogin').addEventListener('click', function(event) {
    event.preventDefault() //ngăn load lại trang

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // gọi API
    fetch(`${API_URL}/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
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
        localStorage.setItem('jwtToken', data.token)
        localStorage.setItem('username', data.username)
        localStorage.setItem('role', data.role)

        showToast('Đăng nhập thành công', "success")
        if(data.role === 'USER' || data.role === 'AUTHOR') {
            window.location.href = 'home.html'
        }
        else {
            window.location.href = 'admin-home.html'
        }
    })
    .catch(error => {
        showToast(error.message, "error")
        console.error('Error: ', error)
    })
})

// ẩn hiện password
const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

toggle.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        toggle.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`;
    } else {
        password.type = "password";
        toggle.innerHTML = `<i class="fa-regular fa-eye"></i>`;
    }
});