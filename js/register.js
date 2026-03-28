const API_URL = "http://localhost:8080/api/auth";

// bấm đăng ký
document.getElementById('btnRegister').addEventListener('click', function(event) {
    event.preventDefault() //ngăn load lại trang

    const emailInput = document.getElementById('email').value;
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // gọi API
    fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailInput,
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
        showToast(data.message, "success")

        window.location.href = 'login.html'
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