// đăng ký làm tác giả
const API = "http://localhost:8080/api"
// token đã có ở project.js

// hiện thị form
async function loadForm() {
    try {
        // gọi API
        const response = await fetch(`${API}/users/myInfo`, {
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
        const email = document.getElementById('emailAuthor')
        email.value = data.email

        const fullName = document.getElementById('fullNameAuthor')
        fullName.value = data.fullName == null ? "" : data.fullName

        const gender = document.getElementById('genderAuthor')
        gender.value = data.gender == null ? "Khác" : data.gender

        if(data.dob != null) {
            document.getElementById('dobAuthor').value = data.dob
        }
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}


// lấy lịch sử nộp đơn
let registerDetail = null
async function registerHistory() {
    try {
         //gọi API
        const response = await fetch(`${API}/authors/register`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            // Cố gắng đọc nội dung lỗi từ server trả về
            const errData = await response.json().catch(() => ({}))
            const errMessage = errData.error || errData.message || "Có lỗi xảy ra khi cập nhật"
            throw new Error(errMessage)
        }
        
        const data = await response.json().catch(() => ({}))
        registerDetail = data
        //render ra bảng
        const tableBody = document.getElementById('register-table');
        tableBody.innerHTML = ''

        if(data.requestId == null) return
        
        const row = document.createElement('tr')

        const reviewAt = data.reviewAt == null ? "Chưa duyệt" : data.reviewAt
        let statusText = 'Chờ duyệt'
        let statusClass = 'font-semibold text-warning'
        if (data.status == "ACCEPT") {
            statusText = 'Đã duyệt'
            statusClass = 'font-semibold text-success'
        }
        else if(data.status == "REJECT") {
            statusText = 'Bị từ chối'
            statusClass = 'font-semibold text-error'
        }

        row.innerHTML = `
            <td class="p-3">${data.requestId}</td>
            <td class="p-3">${data.createdAt}</td>
            <td class="p-3">${reviewAt}</td>
            <td class="p-3 ${statusClass}">${statusText}</td>
            <td class="p-4">
                <button onclick="openRegisterDetail()" class="text-p-600 hover:text-p-800 hover:cursor-pointer font-medium">Chi tiết</button>
            </td>
        `;
        tableBody.appendChild(row)
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

loadForm()
registerHistory()
// xem chi tiết đơn
function openRegisterDetail() {
    if(registerDetail) {
        const reviewAt = registerDetail.reviewAt == null ? "Chưa duyệt" : registerDetail.reviewAt
        const modalContentHTML = `
            <div class="md:col-span-2 border-b pb-2 mb-2"><strong class="text-n-800">Mã đơn:</strong> <span class="font-mono text-xs">${registerDetail.requestId}</span></div>
            <div><strong class="text-n-800">Họ và tên:</strong> ${registerDetail.fullName}</div>
            <div><strong class="text-n-800">Email:</strong> ${registerDetail.email}</div>
            <div><strong class="text-n-800">Giới tính:</strong> ${registerDetail.gender}</div>
            <div><strong class="text-n-800">Ngày sinh:</strong> ${registerDetail.dob}</div>
            <div class="md:col-span-2"><strong class="text-n-800">Tài khoản ngân hàng:</strong> ${registerDetail.bankAccount}</div>
            <div class="md:col-span-2 bg-n-100 p-4 rounded-lg">
                <strong class="text-n-800 mb-2">Mô tả:</strong> 
                <div class="max-h-[150px] overflow-y-auto break-words">
                    ${registerDetail.description}
                </div>
            </div>
            <div><strong class="text-n-800">Ngày nộp:</strong> ${registerDetail.createdAt}</div>
            <div><strong class="text-n-800">Ngày review:</strong> ${reviewAt}</div>
        `;
    
        document.getElementById('register-content').innerHTML = modalContentHTML;
        document.getElementById('register-detail').classList.remove('hidden');
    }
}

// đóng đơn
function closeDetail() {
    document.getElementById('register-detail').classList.add('hidden');
}

// nộp đơn đăng ký
document.getElementById('registerAuthorBtn').addEventListener('click',async function(event) {
    event.preventDefault() //ngăn load lại trang

    // lấy giá trị từ các ô input
    const fullNameValue = document.getElementById('fullNameAuthor').value
    const dobValue = document.getElementById('dobAuthor').value
    const genderValue = document.getElementById('genderAuthor').value
    const stkValue = document.getElementById('stk').value
    const descriptionValue = document.getElementById('description').value

    try {
        //gọi API
        const response = await fetch(`${API}/authors/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: fullNameValue,
                dob: dobValue,
                gender: genderValue,
                bankAccount: stkValue,
                description: descriptionValue
            })
        })

        if (!response.ok) {
            // Cố gắng đọc nội dung lỗi từ server trả về
            const errData = await response.json().catch(() => ({}))
            const errMessage = errData.error || errData.message || "Có lỗi xảy ra khi cập nhật"
            throw new Error(errMessage)
        }
        
        const data = await response.json().catch(() => ({}))
        showToast(data.message, 'info')
        loadForm()
        loadInfo()
        registerHistory()
    } catch (error) {
        showToast(error.message, 'warning')
        console.error('Error: ', error)
    }
})