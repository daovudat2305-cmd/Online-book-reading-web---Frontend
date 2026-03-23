
function openQR(price) {

    const content = "VIP_" + Date.now()

    const qr = `https://img.vietqr.io/image/MB-0343649920-compact.png?amount=${price}&addInfo=${content}'/>`

    const modal = document.createElement("div")
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"

    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 w-[400px] text-center shadow-lg relative animate-fadeIn">

            <button class="absolute top-2 right-3 text-xl close-btn hover:cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <h2 class="text-xl font-bold mb-4">Thanh toán VIP</h2>

            <img src="${qr}" class="w-60 mx-auto mb-4">

            <p class="font-semibold mb-2">Số tiền: ${price.toLocaleString()} VNĐ</p>

            <div class="text-left text-sm mt-3">
                <p><b>Ngân hàng:</b> MB Bank</p>
                <p><b>Số TK:</b> 0343649920</p>
                <p><b>Chủ TK:</b> DAO VU DAT</p>
                <p><b>Nội dung:</b> ${content}</p>
            </div>
        </div>
    `

    // đóng modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest(".close-btn")) {
            modal.remove()
        }
    })

    document.body.appendChild(modal)
}
