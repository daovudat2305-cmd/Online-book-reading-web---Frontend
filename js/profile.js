const buttons = document.querySelectorAll(".menu-btn")
const tabs = document.querySelectorAll(".tab")

buttons.forEach(btn => {

    btn.addEventListener("click", () => {

        // đổi active menu
        buttons.forEach(b => b.classList.remove("menu-btn-active"))
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