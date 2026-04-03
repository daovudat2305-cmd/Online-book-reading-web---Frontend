//hiện thị thông tin sách
let currentBook = null
document.addEventListener("DOMContentLoaded", function() {
    // 1. Lấy mã sách (ID) từ thanh địa chỉ URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const token = localStorage.getItem('jwtToken');

    if (!bookId) {
        alert("Không tìm thấy mã sách!");
        window.location.href = "home.html";
        return;
    }

    // 2. Gọi API lấy thông tin chi tiết sách

    fetch(`http://localhost:8080/api/books/${bookId}`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Không thể tải thông tin sách!");
        return res.json();
    })
    .then(book => {
        // Đổ dữ liệu vào giao diện người dùng
        currentBook = book
        if(document.getElementById('detail-title')) 
            document.getElementById('detail-title').innerText = book.title;
        
        if(document.getElementById('detail-author'))
            document.getElementById('detail-author').innerText = book.authorName;
        
        if(document.getElementById('detail-date'))
            document.getElementById('detail-date').innerText = new Date(book.createdAt).toLocaleDateString('vi-VN');
        
        if(document.getElementById('detail-description'))
            document.getElementById('detail-description').innerText = book.description || "Cuốn sách này chưa có mô tả.";
        
        if(document.getElementById('detail-cover'))
            document.getElementById('detail-cover').src = book.coverImage;

        // Hiển thị thể loại
        const categoryNames = book.categories.map(c => c.categoryName).join(", ");
        if(document.getElementById('detail-categories'))
            document.getElementById('detail-categories').innerText = categoryNames;

        //hiện thị danh sách bình luận, lượt yêu thích
        fetchCommentList(0)
        renderFavoritesByBook()
        statusFavorite()
    })
    .catch(err => {
        console.error("❌ Lỗi load chi tiết sách:", err);
        alert("Lỗi: " + err.message);
    });
});

// =========================================================

// PHẦN XỬ LÝ ĐỌC SÁCH, BÌNH LUẬN, YÊU THÍCH
const btnRead = document.getElementById('btn-read-now'); // Nút "Đọc ngay"
const readModal = document.getElementById('read-modal'); // Cái Modal hiện lên
const pdfFrame = document.getElementById('pdf-frame');     // Cái thẻ iframe chứa PDF
const btnCloseRead = document.getElementById('btn-close-read'); // Nút X đóng modal
//đọc sách
if (btnRead) {
    btnRead.onclick = () => {
        if(isLogin){
            if(currentBook.type=="VIP" && !isVip) {
                showToast("Vui lòng đăng ký VIP để đọc sách!", "warning")
                return
            }
            if (currentBook.fileUrl) {
                // Ép sang https để tránh lỗi trình duyệt
                let secureUrl = currentBook.fileUrl.replace("http://", "https://");
                
                // Hiện Modal
                readModal.classList.remove('hidden');
                
                // Dùng Google Docs Viewer để đọc PDF mượt hơn
                pdfFrame.src = `https://docs.google.com/gview?url=${encodeURIComponent(secureUrl)}&embedded=true`;
            } else {
                alert("File sách hiện chưa khả dụng!");
            }
        }
        else {
            showToast("Vui lòng đăng nhập để đọc sách!", "warning")
            return
        }
    };
}

// Đóng modal đọc sách
if (btnCloseRead) {
    btnCloseRead.onclick = () => {
        readModal.classList.add('hidden');
        pdfFrame.src = ""; // Dừng tải PDF khi đóng
    };
}

//hiển thị danh sách bình luận
const numberOfComments = document.getElementById('numberOfComments')
async function fetchCommentList(page=0, size=15) {
    const bookId = currentBook.bookId

    try {
        const response = await fetch(`http://localhost:8080/api/comments/${bookId}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            } 
        })
        if(response.ok) {
            const data = await response.json()
            renderComments(data.content)
            renderPagination(data.number, data.totalPages)
            numberOfComments.innerText = data.totalElements
        }
        else {
            alert("Lỗi khi tải dữ liệu")
        }
    } catch (error) {
        alert("Lỗi kết nối" + error)
    }
}

function renderComments(listComment) {
    const container = document.getElementById('commentList')
    container.innerHTML = ''

    listComment.forEach(comment => {
        const createdTime = new Date(comment.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
        
        let option = ''
        if(comment.username == localStorage.getItem('username')) {
            option = `
            <div class="relative inline-block text-left ml-2">
                <i class="fa-solid fa-ellipsis-vertical hover:cursor-pointer hover:text-n-800 px-2" onclick="toggleCommentDropdown(event, this)"></i>
                
                <div class="dropdown-comment-menu absolute hidden w-32 mt-2 rounded-lg shadow-lg right-0 bg-foreground z-10 border border-n-200">
                    <button onclick="deleteComment('${comment.commentId}')"
                    class="font-semibold w-full px-4 py-2 text-left hover:bg-n-200 hover:cursor-pointer text-red-500 rounded-lg">
                        Xóa bình luận
                    </button>
                </div>
            </div>
            `
        }

        const commentCard = `
            <div class="flex gap-3 p-4 rounded-lg bg-background">
                <img src="${comment.avatar}" alt="" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                    <div class="flex justify-between">
                        <span class="font-semibold">${comment.username}</span>
                        <span class="text-sm text-gray-500">${createdTime} ${option}</span>
                    </div>
                    <p class="text-n-800">${comment.content}</p>
                </div>
            </div>
        `

        container.insertAdjacentHTML('beforeend', commentCard)
    })
}

function renderPagination(currentPage, totalPages) {
    if(totalPages==0) {
        document.getElementById('commentCurrentPage').innerText = 0
        document.getElementById('commentTotalPages').innerText = 0
        document.getElementById('btnPrevComment').disabled = true
        document.getElementById('btnNextComment').disabled = true
        return
    }
    document.getElementById('commentCurrentPage').innerText = currentPage + 1
    document.getElementById('commentTotalPages').innerText = totalPages

    document.getElementById('btnPrevComment').disabled = currentPage == 0
    document.getElementById('btnNextComment').disabled = currentPage == totalPages-1

    const prevBtn = document.getElementById('btnPrevComment')
    prevBtn.onclick = function() {
        if(currentPage !== 0) changePage(currentPage - 1)
    }

    const nextBtn = document.getElementById('btnNextComment')
    nextBtn.onclick = function() {
        if(currentPage !== totalPages-1) changePage(currentPage + 1)
    }
}

function changePage(pageIndex) {
    fetchCommentList(pageIndex)
}

// ===========================================================

// xóa bình luận
function toggleCommentDropdown(event, element) {
    event.stopPropagation()

    const commentMenu = element.nextElementSibling

    document.querySelectorAll('.dropdown-comment-menu').forEach(m => {
        if(m!=commentMenu) {
            m.classList.add('hidden')
        }
    })
    commentMenu.classList.toggle('hidden')
}
//bấm ra ngoài để ẩn
document.addEventListener('click', function(event) {
    const commentMenus = document.querySelectorAll('.dropdown-comment-menu')
    commentMenus.forEach(menu => {
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    })
})

async function deleteComment(commentId) {
    try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentId}?username=${localStorage.getItem('username')}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })
        if(response.ok) {
            const data = await response.json()
            showToast(`${data.success}`, "info")
            fetchCommentList(0)
        }
        else {
            alert("Lỗi khi xóa bình luận")
        }
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

// ===================================================================

// bình luận sách
const commentInput = document.getElementById("commentInput")
const commentBtn = document.getElementById('comment-btn')
const commentCancelBtn = document.getElementById('comment-cancel-btn')

commentBtn.addEventListener('click', async function() {
    console.log(user)
    if(!isLogin) {
        showToast("Vui lòng đăng nhập!", "warning")
        return
    }
    const contentComment = commentInput.value
    console.log(contentComment)
    if(contentComment==null || contentComment.trim().length==0) {
        showToast("Bình luận không được trống!", "warning")
        return
    }
    try {
        const response = await fetch(`http://localhost:8080/api/comments/${currentBook.bookId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            },
            body: contentComment
        })
        if(!response.ok) {
            const errData = await response.json();
            const errMessage = errData.error || JSON.stringify(errData)
            throw new Error(errMessage || "Có lỗi xảy ra ở máy chủ")
        }
        fetchCommentList(0)
        commentInput.value = ""
        commentInput.blur()
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
})

commentCancelBtn.addEventListener('click', function() {
    commentInput.value = ""
    
    commentInput.blur()
})

//=============================================================


// yêu thích sách
// hiển thị số lượt yêu thích
const bookFavorites = document.getElementById('book-favorites')
async function renderFavoritesByBook() {
    const bookId = currentBook.bookId
    try {
        const response = await fetch(`http://localhost:8080/api/favorites/${bookId}/count`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if(response.ok) {
            const data = await response.json()
            bookFavorites.innerText = data.favorites
        }
        else {
            alert('Lỗi khi tải dữ liệu!')
        }
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

const favoriteBtn = document.getElementById('favorite-btn')
//hiển thị màu tym nếu người dùng đã bấm thích
async function statusFavorite() {
    if(!isLogin) {
        return
    }
    const bookId = currentBook.bookId
    try {
        const response = await fetch(`http://localhost:8080/api/favorites/${bookId}?username=${localStorage.getItem('username')}`, {
            method: "GET",
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
        if(data.status) {
            favoriteBtn.classList.add('text-rose-500')
        }
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

favoriteBtn.addEventListener('click', async function() {
    const bookId = currentBook.bookId
    if(!isLogin) {
        showToast('Vui lòng đăng nhập!', "warning")
        return
    }
    try {
        const response = await fetch(`http://localhost:8080/api/favorites/${bookId}?username=${localStorage.getItem('username')}`, {
            method: "POST",
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
        if(data.status == "add") {
            favoriteBtn.classList.add('text-rose-500')
            bookFavorites.innerText = parseInt(bookFavorites.innerText) + 1
        }
        else {
            favoriteBtn.classList.remove('text-rose-500')
            bookFavorites.innerText = parseInt(bookFavorites.innerText) - 1
        }
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
})