// 1. Biến toàn cục để quản lý trạng thái
let currentSearchKeyword = "";
let currentPage = 0;
let pageSize = 16;

document.addEventListener("DOMContentLoaded", function () {
  loadRecommendedSlider();
  loadBooks();
});

// 2. Hàm gọi API duy nhất (Dùng chung cho Load/Search/Phân trang)
function loadBooks(page = 0, keyword = "") {
  currentPage = page;
  currentSearchKeyword = keyword;

  console.log(`📚 Đang tải sách trang ${page}, từ khóa: "${keyword}"`);

  // categories và type để trống thì Backend tự hiểu là lấy tất cả sách đã duyệt
  const safeKeyword = encodeURIComponent(keyword);
  const apiUrl = `http://localhost:8080/api/books/filter?keyword=${safeKeyword}&page=${page}&size=${pageSize}&sort=latest`;

  fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Đảm bảo lấy token từ localStorage
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Lỗi Server hoặc sai đường dẫn API");
      return res.json();
    })
    .then((data) => {
      // data lúc này là Page<Book>
      renderBooks(data.content);
      renderPagination(data.totalPages, data.number);
    })
    .catch((err) => {
      console.error("❌ Lỗi load sách:", err);
      renderBooks([]); // Hiện thông báo không tìm thấy
    });
}

// 3. HÀM VẼ NÚT PHÂN TRANG (Giữ nguyên logic nhưng dùng loadBooks mới)
function renderPagination(totalPages, currentPage) {
  const paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  // --- NÚT VỀ ĐẦU ---
  const firstBtn = document.createElement("button");
  firstBtn.innerHTML = '<i class="fa-solid fa-angles-left"></i>';
  firstBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-p-500 hover:bg-p-100"}`;
  firstBtn.disabled = currentPage === 0;
  firstBtn.onclick = () => {
    loadBooks(0, currentSearchKeyword);
    scrollToBooks();
  };
  paginationContainer.appendChild(firstBtn);

  // Nút Trước
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Trước';
  prevBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-p-500 hover:bg-p-100"}`;
  prevBtn.disabled = currentPage === 0;
  prevBtn.onclick = () => {
    loadBooks(currentPage - 1, currentSearchKeyword);
    scrollToBooks();
  };
  paginationContainer.appendChild(prevBtn);

  // 5 nút giữa
  let maxVisibleButtons = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxVisibleButtons / 2));
  let endPage = startPage + maxVisibleButtons - 1;

  // nếu endPage vượt quá tổng số trang
  if (endPage >= totalPages) {
    endPage = totalPages - 1;
    startPage = Math.max(0, endPage - maxVisibleButtons + 1);
  }

  // Các nút số
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.innerText = i + 1;
    pageBtn.className =
      i === currentPage
        ? "px-4 py-2 border rounded-lg bg-p-400 text-white font-bold shadow-md"
        : "px-4 py-2 border rounded-lg bg-white text-n-800 hover:bg-p-100 transition";
    pageBtn.onclick = () => {
      loadBooks(i, currentSearchKeyword);
      scrollToBooks();
    };
    paginationContainer.appendChild(pageBtn);
  }

  // Nút Sau
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = 'Sau <i class="fa-solid fa-chevron-right"></i>';
  nextBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === totalPages - 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-p-500 hover:bg-p-100"}`;
  nextBtn.disabled = currentPage === totalPages - 1;
  nextBtn.onclick = () => {
    loadBooks(currentPage + 1, currentSearchKeyword);
    scrollToBooks();
  };
  paginationContainer.appendChild(nextBtn);

  // --- NÚT VỀ CUỐI ---
  const lastBtn = document.createElement("button");
  lastBtn.innerHTML = '<i class="fa-solid fa-angles-right"></i>';
  lastBtn.className = `px-4 py-2 border rounded-lg font-medium transition ${currentPage === totalPages - 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-p-500 hover:bg-p-100"}`;
  lastBtn.disabled = currentPage === totalPages - 1;
  // Chuyển tới trang cuối cùng (totalPages - 1)
  lastBtn.onclick = () => {
    loadBooks(totalPages - 1, currentSearchKeyword);
    scrollToBooks();
  };
  paginationContainer.appendChild(lastBtn);
}

// HÀM HỖ TRỢ: Cuộn màn hình đến khu vực "Sách hay" một cách mượt mà
function scrollToBooks() {
  const bookGrid = document.getElementById("book-grid");
  if (bookGrid) {
    // Lấy thẻ <h2> "Sách hay" (nằm ngay sát trên danh sách grid)
    const heading = bookGrid.previousElementSibling;

    // Tính toán vị trí: Tọa độ của thẻ h2 trừ đi 100px
    // (100px này chừa khoảng trống cho thanh Search đang trôi lơ lửng ở trên)
    const scrollPosition =
      heading.getBoundingClientRect().top + window.scrollY - 100;

    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }
}

// 4. Bắt sự kiện ô tìm kiếm (Giữ nguyên logic Debounce)
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      // BỎ HẾT setTimeout VÀ clearTimeout
      currentSearchKeyword = this.value.trim();
      currentPage = 0; // Luôn về trang 0 khi tìm kiếm mới
      loadBooks(0, currentSearchKeyword); // Gọi API ngay lập tức
    });
  }
});

// 5. Hàm chuyên làm nhiệm vụ vẽ sách ra HTML
function renderBooks(booksToRender) {
  const bookGrid = document.getElementById("book-grid");
  if (!bookGrid) return;

  bookGrid.innerHTML = ""; // Xóa danh sách cũ

  // Nếu không có sách nào trả về
  if (!booksToRender || booksToRender.length === 0) {
    bookGrid.innerHTML =
      '<p class="text-center w-full col-span-full mt-10 text-gray-500">Không tìm thấy cuốn sách nào phù hợp.</p>';
    return;
  }

  // Lặp qua danh sách sách và tạo HTML cho từng cuốn
  booksToRender.forEach((book) => {
    const vipBadge =
      book.type && book.type.trim().toUpperCase() === "VIP"
        ? `<span class="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">VIP</span>`
        : "";

    const defaultImage = "../assets/book.jpg";
    const imageSource = book.coverImage ? book.coverImage : defaultImage;

    const bookItem = `
            <div class="cursor-pointer bg-white p-3 rounded-lg shadow hover:shadow-lg transition group relative" 
                 onclick="location.href='book-detail.html?id=${book.bookId}'">
                
                <div class="overflow-hidden rounded-md mb-3 relative">
                    ${vipBadge}
                    <img src="${imageSource}" alt="${book.title}" 
                         onerror="this.onerror=null; this.src='${defaultImage}';"
                         class="w-full h-64 object-cover group-hover:scale-105 transition duration-300">
                </div>
                
                <h3 class="font-bold text-n-800 text-sm line-clamp-2 mb-1">${book.title}</h3>
                <p class="text-xs text-gray-500">${book.authorName || "Ẩn danh"}</p>
            </div>
        `;
    bookGrid.innerHTML += bookItem;
  });
}

// ===================================================================
// đề xuất sách
async function loadRecommendedSlider() {
  const username =
    localStorage.getItem("username") == null
      ? ""
      : localStorage.getItem("username");
  const sliderWrapper = document.getElementById("slider-wrapper");
  if (!sliderWrapper) return;

  let loadingAnimation = "";
  for (let i = 0; i < 4; i++) {
    loadingAnimation += `
      <div class="swiper-slide !h-auto flex mr-4" style="width: 23%;">
          <div class="relative flex flex-col w-full h-full p-3 bg-white border border-transparent rounded-lg shadow">
              <div class="relative mb-3 overflow-hidden rounded-md h-56 bg-gray-200 animate-pulse"></div>
              
              <div class="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
              <div class="h-4 bg-gray-200 animate-pulse rounded w-2/3 mb-2"></div>
              
              <div class="mt-auto h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
          </div>
      </div>
    `;
  }

  // Đổ khung xương vào HTML ngay lập tức để user xem trong lúc chờ đợi
  sliderWrapper.innerHTML = loadingAnimation;

  try {
    //gọi api lấy sách đề xuất
    const response = await fetch(
      `http://localhost:8080/api/books/recommend?username=${username}`,
    );
    if (!response.ok) throw new Error("Lỗi tải sách đề xuất");

    const recommendedBooks = await response.json();

    sliderWrapper.innerHTML = "";

    //tạo slide sách
    recommendedBooks.forEach((book) => {
      const vipBadge =
        book.type && book.type.trim().toUpperCase() === "VIP"
          ? `<span class="absolute px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded shadow z-10 top-2 left-2">VIP</span>`
          : "";

      const defaultImage = "../assets/book.jpg";
      const imageSource = book.coverImage ? book.coverImage : defaultImage;

      const slideHTML = `
                <div class="swiper-slide !h-auto flex">
                    <div class="relative flex flex-col w-full h-full p-3 transition bg-white border border-transparent rounded-lg shadow cursor-pointer hover:shadow-xl group hover:border-p-300" 
                         onclick="location.href='book-detail.html?id=${book.bookId}'">
                        
                        <div class="relative mb-3 overflow-hidden rounded-md">
                            ${vipBadge}
                            <img src="${imageSource}" alt="${book.title}" 
                                 onerror="this.onerror=null; this.src='${defaultImage}';"
                                 class="object-cover w-full h-56 transition duration-500 group-hover:scale-110">
                            
                            <div class="absolute bottom-0 left-0 w-full p-2 text-xs font-medium text-white bg-gradient-to-t from-black/70 to-transparent">
                                <i class="fa-regular fa-eye"></i> ${book.viewCount || 0}
                            </div>
                        </div>
                        
                        <h3 class="mb-1 text-sm font-bold line-clamp-2 text-n-800 h-10">${book.title}</h3>
                        
                        <p class="mt-auto text-xs text-gray-500 truncate">${book.authorName || "Ẩn danh"}</p>
                    </div>
                </div>
            `;
      sliderWrapper.innerHTML += slideHTML;
    });

    //chạy hiệu ứng
    initRecommendedSwiper();
  } catch (error) {
    console.error("Lỗi tải Slider Đề xuất:", error);
    sliderWrapper.innerHTML =
      '<p class="p-4 text-red-500">Đang có lỗi xảy ra với hệ thống đề xuất.</p>';
  }
}

// cấu hình tính năng trượt
function initRecommendedSwiper() {
  new Swiper(".mySwiper", {
    slidesPerView: 4, // Trên điện thoại hiện 2 quyển
    spaceBetween: 20, // Khoảng cách 15px
    loop: true,
    autoplay: {
      delay: 3500, // Trượt sau 4s
      disableOnInteraction: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}
