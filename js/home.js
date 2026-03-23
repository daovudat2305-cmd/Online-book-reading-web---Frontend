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