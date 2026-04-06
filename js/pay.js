//xử lý các phần liên quan đến thanh toán và vip
//đăng ký VIP
async function buyVip(vipId) {
    try {
        const response = await fetch(`http://localhost:8080/api/payment/create?vipId=${vipId}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}` 
            },
        })

        if(!response.ok) {
            const errData = await response.json();
            const errMessage = errData.error || JSON.stringify(errData)
            throw new Error(errMessage || "Có lỗi xảy ra ở máy chủ")
        }

        const data = await response.json()
        openQR(data)
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

function openQR(data) {

    const qr = `https://qr.sepay.vn/img?bank=MBBank&acc=0343649920&template=compact&amount=${data.amount}&des=${data.content}'/>`

    const modal = document.createElement("div")
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"

    modal.innerHTML = `
        <div id="qr-wrapper" class="bg-white rounded-xl p-6 w-[400px] text-center shadow-lg relative animate-fadeIn">

            <button class="absolute top-2 right-3 text-xl close-btn hover:cursor-pointer">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <h2 class="text-xl font-bold mb-4">Thanh toán VIP</h2>

            <img src="${qr}" class="w-60 mx-auto mb-4">

            <p class="font-semibold mb-2">Số tiền: ${data.amount} VNĐ</p>

            <div class="text-left text-sm mt-3">
                <p><b>Ngân hàng:</b> MB Bank</p>
                <p><b>Số TK:</b> 0343649920</p>
                <p><b>Chủ TK:</b> DAO VU DAT</p>
                <p><b>Nội dung:</b> ${data.content}</p>
            </div>

            <p class="text-sm font-semibold text-gray-500 mt-4 animate-pulse">
                <i class="fa-solid fa-spinner fa-spin"></i> Đang chờ thanh toán...
            </p>
        </div>
    `

    // đóng modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest(".close-btn")) {
            modal.remove()
        }
    })

    document.body.appendChild(modal)

    // Cứ mỗi 3 giây (3000ms), gửi API hỏi Backend 1 lần
    let checkStatusInterval = setInterval(async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/payment/status?paymentId=${data.paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Đảm bảo bạn đã khai báo biến token ở trên cùng file
                }
            })

            if(response.ok) {
                const resData = await response.json()
                if (resData.status === "PAID") {
                    clearInterval(checkStatusInterval)// Dừng việc gọi API liên tục lại
                    
                    //giao diện Báo Thành Công
                    const qrWrapper = document.getElementById("qr-wrapper")
                    if(qrWrapper) {
                        qrWrapper.innerHTML = `
                            <div class="py-8">
                                <i class="fa-solid fa-circle-check text-6xl text-success mb-4"></i>
                                <h2 class="text-2xl font-bold text-success mb-2">Thanh toán thành công!</h2>
                                <p class="text-n-700 mb-6">Tài khoản của bạn đã được nâng cấp VIP.</p>
                                <button class="px-6 py-2 bg-p-400 text-white font-bold rounded-lg hover:bg-p-600 transition close-btn">
                                    Hoàn tất
                                </button>
                            </div>
                        `
                    }
                }
            }
            else {
                alert("Xảy ra lỗi khi tải dữ liệu!")
            }
        } catch (error) {
            alert("Lỗi kết nối" + error)
        }
    }, 3000)

    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest(".close-btn")) {
            // RẤT QUAN TRỌNG: Phải tắt vòng lặp kiểm tra API khi đóng khung
            clearInterval(checkStatusInterval); 
            modal.remove()
            
            loadInfo()
            fetchPaymentHistory(0)
        }
    })
}

async function checkStatus(paymentId) {
    try {
        const response = await fetch(`http://localhost:8080/api/payment/status?paymentId=${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Đảm bảo bạn đã khai báo biến token ở trên cùng file
            }
        })

        if(response.ok) {
            const resData = await response.json()
            if (resData.status === "PAID") {
                clearInterval(checkStatusInterval)// Dừng việc gọi API liên tục lại
                
                //giao diện Báo Thành Công
                const qrWrapper = document.getElementById("qr-wrapper")
                if(qrWrapper) {
                    qrWrapper.innerHTML = `
                        <div class="py-8">
                            <i class="fa-solid fa-circle-check text-6xl text-success mb-4"></i>
                            <h2 class="text-2xl font-bold text-success mb-2">Thanh toán thành công!</h2>
                            <p class="text-n-700 mb-6">Tài khoản của bạn đã được nâng cấp VIP.</p>
                            <button class="px-6 py-2 bg-p-400 text-white font-bold rounded-lg hover:bg-p-600 transition close-btn">
                                Hoàn tất
                            </button>
                        </div>
                    `
                }
            }
        }
        else {
            alert("Xảy ra lỗi khi tải dữ liệu!")
        }
    } catch (error) {
        alert("Lỗi kết nối" + error)
    }
}

function loadVipInterface(daysRemaining) {
    const vipButtons = document.querySelectorAll("#vip button")
    vipButtons.forEach((btn,index) => {
        btn.innerText = "Gia hạn VIP"
    })

    document.getElementById('vipStatus').innerHTML = `
        <p class="font-semibold">Bạn đã là VIP</p>
        <p class="font-semibold">Thời hạn VIP: <span class="text-p-500">${daysRemaining}</span> ngày</p>
    `
}

//hiển thị lịch sử thanh toán
async function fetchPaymentHistory(page=0, size=10) {
    const username = localStorage.getItem('username')
    try {
        //goi API
        const response = await fetch(`http://localhost:8080/api/payment/history/${username}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        })

        if(response.ok) {
            const data = await response.json()
            renderPaymentTable(data.content)
            renderPagination(data.number, data.totalPages)
        }
        else {
            alert("Lỗi khi tải dữ liệu")
        }
    } catch (error) {
        alert("Lỗi kết nối" + error)
    }
}

function renderPaymentTable(listPayments) {
    const tbody = document.getElementById('paymentHistoryBody')
    tbody.innerHTML = ''; // Xóa dữ liệu cũ mỗi lần chuyển trang

    // Chèn từng dòng dữ liệu mới vào bảng
    listPayments.forEach(payment => {
        const paidTime = payment.paidTime == null ? "Chưa thanh toán" : new Date(payment.paidTime).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

        let status = "Đang xử lý"
        let statusColor = "text-warning"
        if(payment.status == "PAID") {
            status = "Thành công"
            statusColor = "text-success"
        }
        else if(payment.status == "CANCELLED") {
            status = "Đã hủy"
            statusColor = "text-error"
        }
        else if(payment.status == "FAIL") {
            status = "Thất bại"
            statusColor = "text-error"
        }

        const paymentRow = `
            <tr class="hover:bg-p-200">
                <td class="p-3">${payment.vipId}</td>
                <td class="p-3">${payment.content}</td>
                <td class="p-3">${payment.amount} VNĐ</td>
                <td class="p-3">${paidTime}</td>
                <td class="p-3 font-semibold ${statusColor}">${status}</td>
            </tr>
        `
        tbody.insertAdjacentHTML('beforeend', paymentRow)
    })
}

function renderPagination(currentPage, totalPages) {
    if(totalPages==0) {
        document.getElementById('paymentCurrentPage').innerText = 0
        document.getElementById('paymentTotalPages').innerText = 0
        document.getElementById('btnPrevPayment').disabled = true
        document.getElementById('btnNextPayment').disabled = true
        return
    }
    document.getElementById('paymentCurrentPage').innerText = currentPage + 1
    document.getElementById('paymentTotalPages').innerText = totalPages

    document.getElementById('btnPrevPayment').disabled = currentPage == 0
    document.getElementById('btnNextPayment').disabled = currentPage == totalPages-1

    const prevBtn = document.getElementById('btnPrevPayment')
    prevBtn.onclick = function() {
        if(currentPage !== 0) changePage(currentPage - 1)
    }

    const nextBtn = document.getElementById('btnNextPayment')
    nextBtn.onclick = function() {
        if(currentPage !== totalPages-1) changePage(currentPage + 1)
    }
}

function changePage(pageIndex) {
    fetchPaymentHistory(pageIndex)
}

// gọi lần đầu tiên khi load xong trang
document.addEventListener("DOMContentLoaded", () => {
    fetchPaymentHistory(0)
})
