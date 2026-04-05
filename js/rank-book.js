//hiện thị xếp hạng sách
document.addEventListener("DOMContentLoaded", () => {
    bookRanking()
})

async function bookRanking() {
    try {
        const response = await fetch(`http://localhost:8080/api/books/rank`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if(!response.ok) {
            const errData = await response.json();
            const errMessage = errData.error || JSON.stringify(errData)
            throw new Error(errMessage || "Có lỗi xảy ra ở máy chủ")
        }
        const data = await response.json()
        renderRankingBook(data)
    } catch (error) {
        alert(error.message)
        console.error('Error: ', error)
    }
}

function renderRankingBook(data) {
    let rank = 1
    const container = document.getElementById('ranking-book')
    data.forEach(book => {
        let textColor = 'text-n-700'
        let borderClass = ''
        if (rank === 1) {
            textColor = "text-[#FFD700]"
            borderClass = "border-2 border-[#FFD700]"
        } else if (rank === 2) {
            textColor = "text-[#9CA3AF]"
            borderClass = "border-2 border-[#9CA3AF]"
        } else if (rank === 3) {
            textColor = "text-[#CD7F32]"
            borderClass = "border-2 border-[#CD7F32]"
        }
        const vipBadge = (book.type && book.type.trim().toUpperCase() === 'VIP') 
            ? `<span class="absolute px-2 py-1 text-[8px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">VIP</span>` 
            : ''

        const bookItem = `
            <div onclick="location.href='book-detail.html?id=${book.bookId}'" class="flex gap-4 rounded-2xl p-2 hover:bg-foreground hover:cursor-pointer hover:-translate-y-1 hover:shadow-lg">
                <!-- Rank -->
                <div class="w-8 flex items-center justify-center text-2xl font-bold ${textColor}">
                    <span class='flex items-center justify-center w-9 h-9 rounded-full ${borderClass}'>
                        ${rank}
                    </span>
                </div>
                
                <!-- Ảnh sách -->
                <div class="relative w-25 overflow-hidden rounded-lg shadow-lg h-35">
                    ${vipBadge}
                    <img src="${book.coverImage}" class="object-cover w-full h-full">
                </div>

                <!-- Nội dung -->
                <div class="space-y-3">
                    <h3 class="text-lg font-semibold">${book.title}</h3>

                    <div class="flex gap-4">
                        <p class="text-sm text-n-800">
                            <i class="fa-regular fa-user"></i>
                            Tác giả: 
                            <br>
                            <span id="book-author">${book.authorName}</span>
                        </p>

                        <p class="text-sm text-n-800">
                            <i class="fa-solid fa-table-list"></i>
                            Thể loại: 
                            <br>
                            <span id="book-category">${book.categories}</span>
                        </p>

                        <p class="text-sm text-n-800">
                            <i class="fa-regular fa-eye"></i>
                            Lượt đọc: <span id="book-views">${book.viewCount}</span>
                        </p>

                        <p class="text-sm text-n-800">
                            <i class="fa-regular fa-comments"></i>
                            Lượt bình luận: <span id="book-views">${book.commentCount}</span>
                        </p>

                        <p class="text-sm text-n-800">
                            <i class="fa-regular fa-heart"></i>
                            Lượt thích: <span id="book-likes">${book.favoCount}</span>
                        </p>
                    </div>
                </div>
            </div>
        `
        container.insertAdjacentHTML('beforeend', bookItem)
        rank+=1
    });
}