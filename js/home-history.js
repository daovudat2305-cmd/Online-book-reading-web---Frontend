document.addEventListener("DOMContentLoaded", function() {

    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
    const guestHistory = document.getElementById('guest-history');
    const userHistory = document.getElementById('user-history');

    const historyContainer = document.getElementById("history-container");
    const paginationContainer = document.getElementById("pagination-container");
    let currentPage = 0;
    const pageSize = 10; 

    if (token) {
        if(guestHistory) guestHistory.style.display = 'none';
        if(userHistory) userHistory.style.display = 'block';
        fetchHistory();
    } else {
        if(guestHistory) guestHistory.style.display = 'block';
        if(userHistory) userHistory.style.display = 'none';
    }

    function fetchHistory() {
        if(!historyContainer) return;

        historyContainer.innerHTML = '<p class="text-center animate-pulse mt-4 font-bold text-gray-500">Đang tải lịch sử của bạn...</p>';
        // Xóa sạch mọi dấu ngoặc kép hoặc khoảng trắng thừa nếu có
        let cleanToken = token.replace(/['"]+/g, '').trim();
        // Kiểm tra xem đã có chữ 'Bearer ' chưa, nếu chưa thì tự ghép vào
        let finalHeader = cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}`;
        
        // In ra màn hình F12 (Console) để xem Token gửi đi có chuẩn không
        console.log("Token đang gửi đi là:", finalHeader); 

        // --- GỌI API ---
        fetch(`http://localhost:8080/api/user/history/list?page=${currentPage}&size=${pageSize}`, {
            method: 'GET',
            headers: {
                'Authorization': finalHeader,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) throw new Error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
            if (response.status === 403) throw new Error("Lỗi 403: Cấu hình bảo mật Backend đang chặn, hoặc Token không đúng định dạng!");
            if (!response.ok) throw new Error("Lỗi Server " + response.status);
            return response.json();
        })
        .then(data => {
            renderHistory(data.content);
            renderPaginationUI(data.totalPages, data.number);
        })
        .catch(error => {
            historyContainer.innerHTML = `<p class="text-center text-red-500 font-bold mt-4">${error.message}</p>`;
        });
    }

    // Hàm chuyển đổi giây thành giờ/phút
    function formatReadingTime(totalSeconds) {
        if (!totalSeconds || totalSeconds < 60) return "Chưa tới 1 phút";
        
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    }

// Hàm chuyển đổi giây thành Giờ / Phút / Giây
function formatReadingTime(totalSeconds) {
    if (!totalSeconds || totalSeconds <= 0) return "0 giây";
    
    // Tính toán Giờ, Phút, Giây
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    // Gom các đoạn text lại
    let parts = [];
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (seconds > 0) parts.push(`${seconds} giây`);
    
    // Nối chúng lại bằng dấu cách
    return parts.join(' ');
}

    // HÀM RENDER LỊCH SỬ
    function renderHistory(historyList) {
        historyContainer.innerHTML = '';
        if (!historyList || historyList.length === 0) {
            historyContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Bạn chưa đọc cuốn sách nào gần đây.</p>';
            return;
        }

        historyList.forEach(item => {
            const book = item.book;
            const dateObj = new Date(item.lastTimeRead);
            const formattedDate = dateObj.toLocaleString('vi-VN', { 
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
            });

            // Ép mảng thể loại thành 1 chuỗi chữ (VD: Tiên hiệp, Kiếm hiệp)
            const categoryNames = (book.categories && book.categories.length > 0) 
                                ? book.categories.map(c => c.categoryName).join(', ') 
                                : 'Chưa cập nhật';

            const html = `
                <div class="flex bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition mb-4">
                    <img src="${book.coverImage || '../assets/book.jpg'}" alt="Bìa" class="w-24 h-36 object-cover rounded-md mr-6">
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">${book.title}</h3>
                            <div class="text-sm text-gray-600 flex items-center space-x-4 mt-2">
                                <span>👤 Tác giả: ${book.authorName || 'Ẩn danh'}</span>
                                <span>🏷️ Thể loại: ${categoryNames}</span>
                                <span>👁️ Lượt đọc: ${book.viewCount || 0}</span>
                            </div>
                            
                            <p class="text-xs text-gray-400 mt-3 flex items-center gap-3">
                                <span>Đã đọc: <span class="text-gray-600 font-semibold">${formattedDate}</span> ${item.currentPage ? `<span class="text-blue-500 font-bold ml-1">(Trang ${item.currentPage})</span>` : ''}</span>
                                
                                <span class="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                    <i class="fa-regular fa-clock mr-1"></i>Thời gian: ${formatReadingTime(item.totalReadingTimeSeconds)}
                                </span>
                            </p>
                            </div>
                        <div class="mt-2">
                            <a href="book-detail.html?id=${book.bookId}" class="inline-block px-4 py-2 bg-purple-500 text-white text-sm font-bold rounded-lg hover:bg-purple-600 transition shadow">Đọc sách</a>
                        </div>
                    </div>
                </div>
            `;
            historyContainer.innerHTML += html;
        });
    }

    function renderPaginationUI(totalPages, page) {
        if(!paginationContainer) return;
        paginationContainer.innerHTML = ''; 
        if(totalPages <= 1) return; 

        const prevBtn = document.createElement('button');
        prevBtn.innerText = 'Trước';
        prevBtn.className = `px-3 py-1 border mx-1 rounded bg-white text-gray-700 transition ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}`;
        prevBtn.disabled = page === 0;
        prevBtn.onclick = () => { if (page > 0) { currentPage = page - 1; fetchHistory(); window.scrollTo({top: 0, behavior: 'smooth'}); } };
        paginationContainer.appendChild(prevBtn);

        for(let i = 0; i < totalPages; i++) {
            const btn = document.createElement('button');
            btn.innerText = i + 1;
            btn.className = `px-3 py-1 border mx-1 rounded transition ${i === page ? 'bg-purple-500 text-white font-bold' : 'bg-white text-gray-700 hover:bg-purple-50 cursor-pointer'}`;
            btn.onclick = () => { currentPage = i; fetchHistory(); window.scrollTo({top: 0, behavior: 'smooth'}); };
            paginationContainer.appendChild(btn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.innerText = 'Sau';
        nextBtn.className = `px-3 py-1 border mx-1 rounded bg-white text-gray-700 transition ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}`;
        nextBtn.disabled = page === totalPages - 1;
        nextBtn.onclick = () => { if (page < totalPages - 1) { currentPage = page + 1; fetchHistory(); window.scrollTo({top: 0, behavior: 'smooth'}); } };
        paginationContainer.appendChild(nextBtn);
    }

});