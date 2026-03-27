const API_URL = "http://localhost:8080/api/admin/authors"
const token = localStorage.getItem('jwtToken')

let currentListAuthors = []

//tải trang
async function fetchListAuthors(page=0, size=12) {
    try {
        // gọi API
        const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        })

        if(response.ok) {
            const data = await response.json()
            currentListAuthors = data.content
            renderListAuthors(data.content)
            renderPagination(data.number, data.totalPages)
        }
        else {
            alert("Lỗi khi tải dữ liệu")
        }
    } catch (error) {
        alert("Lỗi kết nối" + error)
    }
}

function renderListAuthors(listAuthors) {
    const container = document.getElementById('list-authors')
    container.innerHTML = ''

    if(listAuthors.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-n-800">Không có tác giả nào</p>`
        return
    }
    listAuthors.forEach(author => {
        const authorCard = `
            <div onclick="openAuthorDetail('${author.authorId}')" class="flex flex-col items-center block text-center cursor-pointer group">
                <div class="flex items-center justify-center w-full overflow-hidden transition duration-300 border border-dashed rounded-full aspect-square group-hover:shadow-lg border-n-400">
                    <img src="${author.avatar}">
                </div>
                <span class="mt-4 text-[15px] font-medium text-gray-800 group-hover:text-p-400 transition">${author.fullName}</span>
            </div>
        `
        container.insertAdjacentHTML('beforeend', authorCard);
    })
}

function renderPagination(currentPage, totalPages) {
    const container = document.getElementById('pagination-container')
    container.innerHTML = ''

    if(totalPages <= 1) return
    
    // nút trước
    const prevDisabled = currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-n-200 cursor-pointer';
    container.insertAdjacentHTML('beforeend', `
        <button onclick="if(${currentPage !== 0}) changePage(${currentPage - 1})" 
                class="px-4 py-2 font-medium border bg-n-100 border-n-200 ${prevDisabled}">Trước</button>
    `);

    // 5 nút giữa
    let maxVisibleButtons = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = startPage + maxVisibleButtons - 1;

    // nếu endPage vượt quá tổng số trang
    if (endPage >= totalPages) {
        endPage = totalPages - 1;
        startPage = Math.max(0, endPage - maxVisibleButtons + 1);
    }

    // nút số trang
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        const btnClass = isActive 
            ? 'px-4 py-2 font-bold text-white bg-p-400' 
            : 'px-4 py-2 font-medium border border-n-200 bg-n-100 hover:bg-n-200 cursor-pointer';
        
        container.insertAdjacentHTML('beforeend', `
            <button onclick="changePage(${i})" class="${btnClass}">${i + 1}</button>
        `);
    }

    // nút sau
    const nextDisabled = currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-n-200 cursor-pointer';
    container.insertAdjacentHTML('beforeend', `
        <button onclick="if(${currentPage !== totalPages - 1}) changePage(${currentPage + 1})" 
                class="px-4 py-2 font-medium border bg-n-100 border-n-200 ${nextDisabled}">Sau</button>
    `);
}


// màn hình chi tiết
function openAuthorDetail(authorId) {
    // Tìm tác giả trong danh sách đã lưu
    const author = currentListAuthors.find(a => a.authorId === authorId);
    if (!author) return;

    // Đổ dữ liệu vào HTML
    document.getElementById('detail-avatar').src = author.avatar
    document.getElementById('detail-username').innerText = author.username
    document.getElementById('detail-fullName').innerText = author.fullName
    document.getElementById('detail-email').innerText = author.email
    document.getElementById('detail-dob').innerText = author.dob
    document.getElementById('detail-gender').innerText = author.gender
    document.getElementById('detail-stk').innerText = author.bankAccount

    // Ẩn danh sách, hiện chi tiết
    document.getElementById('list-view').classList.add('hidden')
    document.getElementById('detail-view').classList.remove('hidden')
    document.getElementById('detail-view').classList.add('flex')

    // Lưu trạng thái vào lịch sử trình duyệt để bắt nút Back
    history.pushState({ view: 'detail' }, '', `#detail-${authorId}`);
}

// quay lại danh sách
function goBackToList() {
    // Ẩn chi tiết, hiện danh sách
    document.getElementById('detail-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('flex');
    document.getElementById('list-view').classList.remove('hidden');
    
    history.pushState({ view: 'list' }, '', window.location.pathname);
}

// sự kiện bấm nút Back/Forward của trình duyệt
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.view === 'detail') {
        
    } else {
        document.getElementById('detail-view').classList.add('hidden');
        document.getElementById('detail-view').classList.remove('flex');
        document.getElementById('list-view').classList.remove('hidden');
    }
});

function changePage(pageIndex) {
    fetchListAuthors(pageIndex);
}

// gọi lần đầu tiên khi load xong trang
document.addEventListener("DOMContentLoaded", () => {
    fetchListAuthors(0);
});
