// load thông tin giao dịch
const token = localStorage.getItem('jwtToken')
let currentListPayments = []
document.addEventListener('DOMContentLoaded', () => {
    fetchListPayments(0)
    fetchListPaymentRequests(0)
    getTotalRevenueCurrentMonth()
    getNumberOfVipCurrentMonth()
    getNumberOfRequests()

    document.getElementById('filter-date-input').addEventListener('change', applyPaymentFilters)
    document.getElementById('filter-status-select').addEventListener('change', applyPaymentFilters)

    document.getElementById('filter-date-request').addEventListener('change', applyRequestFilters)
    document.getElementById('filter-status-request').addEventListener('change', applyRequestFilters)
})

async function fetchListPayments(page=0, size=20) {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/payments/history?page=${page}&size=${size}`, {
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
        const data = await response.json()
        currentListPayments = data.content
        renderPaymentTable(data.content)
        renderPaymentPagination(data.number, data.totalPages)
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

async function getTotalRevenueCurrentMonth() {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/payments/revenue`, {
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

        const data = await response.json()
        document.getElementById('totalRevenue').innerText = data.totalRevenue
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

async function getNumberOfVipCurrentMonth() {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/payments/registerVip`, {
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

        const data = await response.json()
        document.getElementById('numberOfVip').innerText = data.numberOfVip
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

//tìm kiếm
async function searchPayment(page=0, size=20) {
    const searchInput = document.getElementById('searchPaymentInput')

    const keyword = searchInput.value
    if(keyword.length==null || keyword.trim().length==0) {
        fetchListPayments(0)
        return
    } 

    try {
        // gọi API
        const response = await fetch(`http://localhost:8080/api/admin/payments/history/${keyword.trim()}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        })

        if(response.ok) {
            const data = await response.json()
            currentListPayments = data.content
            renderPaymentTable(data.content)
            renderPaymentPagination(data.number, data.totalPages)
        }
        else {
            alert("Lỗi khi tải dữ liệu")
        }
    } catch (error) {
        alert("Lỗi kết nối" + error)
    }
}

function renderPaymentTable(listPayments) {
    const tbody = document.getElementById('listPaymentBody')
    tbody.innerHTML = ''; // Xóa dữ liệu cũ mỗi lần chuyển trang

    // không có giao dịch nào
    if (!listPayments || listPayments.length === 0) {
        const emptyRow = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-md font-semibold text-gray-500">
                    Không có giao dịch nào phù hợp
                </td>
            </tr>
        `
        tbody.insertAdjacentHTML('beforeend', emptyRow)
        return
    }

    // Chèn từng dòng dữ liệu mới vào bảng
    listPayments.forEach(payment => {
        const paidTime = payment.paidTime == null ? "Chưa thanh toán" : new Date(payment.paidTime).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

        let status = "Đang xử lý"
        let statusColor = "text-warning"
        let statusAmount = "text-n-700"
        let statusSymbol = ""
        if(payment.status == "PAID") {
            status = "Thành công"
            statusColor = "text-success"
            statusAmount = "text-success"
            statusSymbol = "+"
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
                <td class="px-6 text-md py-4 font-semibold">${payment.userRole}</td>
                <td class="px-6 text-md py-4 font-semibold">${payment.username}</td>
                <td class="px-6 text-md py-4 text-center font-semibold">${payment.vipId}</td>
                <td class="px-6 text-md py-4 text-center font-semibold ${statusAmount}">${statusSymbol} ${payment.amount} VNĐ</td>
                <td class="px-6 text-md py-4 font-semibold">${paidTime}</td>
                <td class="px-6 text-md py-4 font-semibold ${statusColor}">${status}</td>
            </tr>
        `
        tbody.insertAdjacentHTML('beforeend', paymentRow)
    })
}

function renderPaymentPagination(currentPage, totalPages) {
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
        if(currentPage !== 0) changePaymentPage(currentPage - 1)
    }

    const nextBtn = document.getElementById('btnNextPayment')
    nextBtn.onclick = function() {
        if(currentPage !== totalPages-1) changePaymentPage(currentPage + 1)
    }
}

function changePaymentPage(pageIndex) {
    fetchListPayments(pageIndex)
}

function applyPaymentFilters() {
    const dateValue = document.getElementById('filter-date-input')?.value
    const statusValue = document.getElementById('filter-status-select')?.value

    const filteredPayments = currentListPayments.filter(payment => {
        let matchDate = true
        if (dateValue) {
            if (payment.paidTime) {
                let d = new Date(payment.paidTime)
                // Định dạng ngày về chuỗi YYYY-MM-DD để so sánh chuẩn xác với ô input
                let paymentDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                matchDate = (paymentDateStr === dateValue)
            } else {
                matchDate = false;
            }
        }

        let matchStatus = true
        if (statusValue && statusValue !== 'all') {
            matchStatus = (payment.status == statusValue);
        }

        return matchDate && matchStatus
    })

    renderPaymentTable(filteredPayments)
}

// ======================================================================
// Yêu cầu trả lương tác giả
let currentListRequests = []

async function fetchListPaymentRequests(page=0, size=20) {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/paymentRequests?page=${page}&size=${size}`, {
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
        const data = await response.json()
        currentListRequests = data.content
        renderRequestTable(data.content)
        renderRequestPagination(data.number, data.totalPages)
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

function renderRequestTable(listPaymentRequests) {
    const tbody = document.getElementById('listRequestsBody')
    tbody.innerHTML = ''; // Xóa dữ liệu cũ mỗi lần chuyển trang

    // không có giao dịch nào
    if (!listPaymentRequests || listPaymentRequests.length === 0) {
        const emptyRow = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-md font-semibold text-gray-500">
                    Không có yêu cầu nào
                </td>
            </tr>
        `
        tbody.insertAdjacentHTML('beforeend', emptyRow)
        return
    }

    // Chèn từng dòng dữ liệu mới vào bảng
    listPaymentRequests.forEach(request => {
        const createdAt = new Date(request.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
        const paidAt = request.paidAt == null ? "Chưa duyệt" : new Date(request.paidAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

        let status = "Đang xử lý"
        let statusColor = "text-warning"
        let statusAmount = "text-n-700"
        let statusSymbol = ""
        if(request.status == "PAID") {
            status = "Đã đồng ý"
            statusColor = "text-success"
            statusAmount = "text-error"
            statusSymbol = "-"
        }
        else if(request.status == "REJECTED") {
            status = "Đã từ chối"
            statusColor = "text-error"
        }

        const requestRow = `
            <tr class="border-b border-gray-200 hover:bg-n-200">
                <td class="px-4 py-3 font-medium">${request.authorName}</td>
                <td class="px-4 py-3">${request.content}</td>
                <td class="px-6 text-md py-4 text-center font-semibold ${statusAmount}">${statusSymbol} ${request.amount} VNĐ</td>
                <td class="px-4 py-3">${paidAt}</td>
                <td class="px-4 py-3 font-semibold ${statusColor}">${status}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex justify-center gap-2">
                        <button onclick="processPaymentRequest('${request.paymentRequestId}', 'APPROVE')" class="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600 hover:cursor-pointer">Duyệt</button>
                        <button onclick="processPaymentRequest('${request.paymentRequestId}', 'REJECT')" class="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 hover:cursor-pointer">Từ chối</button>
                    </div>
                </td>
            </tr>
        `
        tbody.insertAdjacentHTML('beforeend', requestRow)
    })
}

function renderRequestPagination(currentPage, totalPages) {
    if(totalPages==0) {
        document.getElementById('requestCurrentPage').innerText = 0
        document.getElementById('requestTotalPages').innerText = 0
        document.getElementById('btnPrevRequest').disabled = true
        document.getElementById('btnNextRequest').disabled = true
        return
    }
    document.getElementById('requestCurrentPage').innerText = currentPage + 1
    document.getElementById('requestTotalPages').innerText = totalPages

    document.getElementById('btnPrevRequest').disabled = currentPage == 0
    document.getElementById('btnNextRequest').disabled = currentPage == totalPages-1

    const prevBtn = document.getElementById('btnPrevRequest')
    prevBtn.onclick = function() {
        if(currentPage !== 0) changeRequestPage(currentPage - 1)
    }

    const nextBtn = document.getElementById('btnNextRequest')
    nextBtn.onclick = function() {
        if(currentPage !== totalPages-1) changeRequestPage(currentPage + 1)
    }
}

function changeRequestPage(pageIndex) {
    fetchListPaymentRequests(pageIndex)
}

async function getNumberOfRequests() {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/paymentRequests/count`, {
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

        const data = await response.json()
        document.getElementById('numberOfRequestIsPending').innerText = data.numberOfRequests
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

function applyRequestFilters() {
    const dateValue = document.getElementById('filter-date-request')?.value
    const statusValue = document.getElementById('filter-status-request')?.value

    const filteredRequests = currentListRequests.filter(request => {
        let matchDate = true
        if (dateValue) {
            if (request.paidAt) {
                let d = new Date(request.paidAt)
                // Định dạng ngày về chuỗi YYYY-MM-DD để so sánh chuẩn xác với ô input
                let requestDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                matchDate = (requestDateStr === dateValue)
            } else {
                matchDate = false;
            }
        }

        let matchStatus = true
        if (statusValue && statusValue !== 'all') {
            matchStatus = (request.status == statusValue);
        }

        return matchDate && matchStatus
    })

    renderRequestTable(filteredRequests)
}
// ==============================================================
// duyệt yêu cầu
async function processPaymentRequest(requestId, action) {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/paymentRequests/process?requestId=${requestId}&action=${action}`, {
            method: 'PATCH',
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

        const data = await response.json()
        showToast(data.message, "info")
        fetchListPaymentRequests(0)
        getNumberOfRequests()
        getTotalRevenueCurrentMonth()
    } catch (error) {
        showToast(error.message, "warning")
        console.error('Error: ', error)
    }
}

// ==============================================================
// chuyển đổi qua lại giữa 2 bảng
function switchTableView() {
    const selectedType = document.getElementById("transactionType").value;
    
    const tableVip = document.getElementById("tableVip");
    const tableSalary = document.getElementById("tableSalary");

    // 3. Logic ẩn hiện (Xóa hoặc thêm class 'hidden' của Tailwind)
    if (selectedType === "nap") {
        // Hiện bảng nạp, Ẩn bảng lương
        tableVip.classList.remove("hidden");
        tableSalary.classList.add("hidden");
        
        fetchListPayments(0)
        
    } else if (selectedType === "rut") {
        // Hiện bảng lương, Ẩn bảng nạp
        tableVip.classList.add("hidden");
        tableSalary.classList.remove("hidden");
        
        fetchListPaymentRequests(0)
    }
}