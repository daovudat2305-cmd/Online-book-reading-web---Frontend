document.addEventListener("DOMContentLoaded", function () {
  const btnSearch = document.getElementById("btn-search");
  const emptyState = document.getElementById("empty-state");
  const searchResults = document.getElementById("search-results");
  const bookGridContainer = document.getElementById("book-grid-container");
  const searchInput = document.querySelector('input[type="text"]');
  const filterPending = document.getElementById("filter-pending"); // Ô checkbox "Chờ duyệt đăng"

  // Lấy danh sách các ô Thể loại và ô Sắp xếp (Cập nhật dùng class và name mới)
  const categoryCheckboxes = document.querySelectorAll(
    'input[name="categories"]',
  );
  const sortRadios = document.querySelectorAll('input[name="admin-sort"]'); // Lấy các nút radio sắp xếp mới

  // Biến toàn cục lưu trữ data (Nâng cấp thêm biến phân trang)
  let currentBooks = [];
  let isCurrentPending = false;
  let currentPage = 0; // Biến lưu trang hiện tại
  const pageSize = 18; // Số lượng sách mỗi trang

  // 1. GẮN SỰ KIỆN CHO CÁC NÚT & CHECKBOX

  // Bấm nút Tìm kiếm (hoặc Enter)
  if (btnSearch) {
    btnSearch.addEventListener("click", function () {
      emptyState.classList.add("hidden");
      searchResults.classList.remove("hidden");
      currentPage = 0; // Tìm kiếm mới về trang 0
      applyFiltersAndSort();
    });
  }
  if (searchInput) {
    // Gõ phát chạy luôn (Tốc độ cũ - không delay)
    searchInput.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        emptyState.classList.add("hidden");
        searchResults.classList.remove("hidden");
      }
      currentPage = 0;
      applyFiltersAndSort();
    });

    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        emptyState.classList.add("hidden");
        searchResults.classList.remove("hidden");
        currentPage = 0;
        applyFiltersAndSort();
      }
    });
  }

  // Tích ô Sách Chờ Duyệt -> Đổi API
  if (filterPending) {
    filterPending.addEventListener("change", function () {
      isCurrentPending = this.checked;
      currentPage = 0; // Đổi trạng thái về trang 0
      applyFiltersAndSort(); // Dùng chung hàm gọi API filter
    });
  }

  // Tích các ô Thể loại -> Gọi API lọc từ Server
  if (categoryCheckboxes) {
    categoryCheckboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        currentPage = 0;
        applyFiltersAndSort();
      });
    });
  }

  // THAY ĐỔI: Gắn sự kiện cho các nút radio sắp xếp (Lượt xem, Ngày cập nhật)
  if (sortRadios) {
    sortRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        currentPage = 0;
        applyFiltersAndSort();
      });
    });
  }

  // 2. HÀM LẤY SÁCH TỪ SERVER (ĐÃ NÂNG CẤP DÙNG API FILTER ĐA NĂNG)

  function fetchBooks(apiUrl) {
    const token =
      localStorage.getItem("jwtToken") || localStorage.getItem("token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      return;
    }

    bookGridContainer.innerHTML =
      '<p class="col-span-full text-center font-bold animate-pulse">Đang tải dữ liệu...</p>';

    console.log("🚀 Admin calling API:", apiUrl);

    fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 403)
          throw new Error("403 - Lỗi phân quyền Admin");
        if (!response.ok) throw new Error("Lỗi Server " + response.status);
        return response.json();
      })
      .then((data) => {
        // data bây giờ là đối tượng Page (Pageable)
        currentBooks = data.content;
        renderBooks(currentBooks, isCurrentPending);
        // Gọi hàm vẽ phân trang (ông cần thêm 1 div id="pagination-container" ở HTML admin)
        renderPaginationUI(data.totalPages, data.number);
      })
      .catch((error) => {
        bookGridContainer.innerHTML = `<p class="col-span-full text-center text-red-500 font-bold">Lỗi: ${error.message}</p>`;
      });
  }

  // 3. TỔNG CỤC LỌC VÀ SẮP XẾP (ĐÃ CHUYỂN SANG NỐI CHUỖI API)

  function applyFiltersAndSort() {
    if (emptyState) emptyState.classList.add("hidden");
    if (searchResults) searchResults.classList.remove("hidden");
    // A. Lấy từ khóa TÌM KIẾM (Mã hóa tiếng Việt)
    const query = searchInput
      ? encodeURIComponent(searchInput.value.trim())
      : "";

    // B. Lấy THỂ LOẠI
    const checkedCats = Array.from(categoryCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value)
      .join(",");

    // C. THAY ĐỔI: Lấy giá trị sắp xếp từ Radio Button được chọn
    const activeSort = document.querySelector(
      'input[name="admin-sort"]:checked',
    );
    const sortValue = activeSort ? activeSort.value : "createdAt,desc"; // Mặc định là mới nhất

    const status = isCurrentPending ? 0 : 1;

    // D. QUAN TRỌNG: URL khớp với Context Path '/api' và Controller '/admin/books/filter'
    const url = `http://localhost:8080/api/admin/books/filter?keyword=${query}&categories=${checkedCats}&status=${status}&page=${currentPage}&size=${pageSize}&sort=${sortValue}`;

    fetchBooks(url);
  }

  // 4. HÀM VẼ GIAO DIỆN (ĐÃ THÊM HUY HIỆU VIP)

  function renderBooks(books, isPending) {
    bookGridContainer.innerHTML = "";

    if (!books || books.length === 0) {
      bookGridContainer.innerHTML =
        '<p class="col-span-full text-center text-gray-500 font-bold mt-10">Không tìm thấy cuốn sách nào phù hợp với bộ lọc!</p>';
      return;
    }

    books.forEach((book) => {
      // 1. Huy hiệu Chờ duyệt (Góc PHẢI)
      const pendingBadge = isPending
        ? `<span class="absolute px-2 py-1 text-xs font-bold bg-yellow-400 rounded top-2 right-2 shadow z-20">Chờ duyệt</span>`
        : "";

      // 2. Huy hiệu VIP (Góc TRÁI)
      const vipBadge =
        book.type && book.type.trim().toUpperCase() === "VIP"
          ? `<span class="absolute px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded top-2 left-2 shadow z-20">VIP</span>`
          : "";

      const link = isPending
        ? `admin-approve-book.html?id=${book.bookId}`
        : `admin-book-detail.html?id=${book.bookId}`;

      const bookHtml = `
                <a href="${link}" class="relative flex flex-col items-center block cursor-pointer group">
                    <img src="${book.coverImage || "../assets/book.jpg"}" alt="Bìa" class="w-full aspect-[2/3] object-cover bg-gray-200 group-hover:shadow-lg transition duration-300 rounded-md">
                    ${pendingBadge}
                    ${vipBadge}
                    <span class="mt-3 text-sm font-bold text-n-800 group-hover:text-blue-500 transition text-center line-clamp-2">${book.title}</span>
                    <span class="text-xs text-gray-500 mt-1">Tác giả: ${book.authorName || "Ẩn danh"}</span>
                </a>
            `;
      bookGridContainer.innerHTML += bookHtml;
    });
  }

  // --- HÀM PHÂN TRANG CHO ADMIN (ĐÃ NÂNG CẤP TRƯỚC/SAU) ---
  function renderPaginationUI(totalPages, page) {
    const container = document.getElementById("pagination-container");
    if (!container) {
      console.error(
        "Lỗi: Không tìm thấy <div id='pagination-container'> trong HTML!",
      );
      return;
    }

    container.innerHTML = ""; // Xóa sạch dữ liệu cũ
    if (totalPages <= 1) return; // Chỉ có 1 trang thì ẩn luôn phân trang

    // Helper function để tái sử dụng giao diện các nút
    const createButton = (
      htmlContent,
      isDisabled,
      isActive,
      onClickHandler,
    ) => {
      const btn = document.createElement("button");
      btn.innerHTML = htmlContent;

      // Base class định dạng chung cho nút (căn giữa, bo góc, padding)
      let baseClass =
        "px-3 py-1.5 mx-1 border rounded-md transition flex items-center justify-center min-w-[40px] text-sm ";

      if (isDisabled) {
        // Nút bị vô hiệu hóa (Màu nền xám nhạt, chữ mờ)
        btn.className =
          baseClass +
          "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
        btn.disabled = true;
      } else if (isActive) {
        // Nút đang được chọn (Màu xanh sáng, chữ trắng, in đậm)
        btn.className =
          baseClass +
          "bg-[#4db8ff] text-white font-bold border-[#4db8ff] shadow-sm cursor-default";
      } else {
        // Nút bình thường (Nền trắng, di chuột viền xanh chữ xanh)
        btn.className =
          baseClass +
          "bg-white text-gray-700 border-gray-400 hover:text-[#4db8ff] hover:border-[#4db8ff] cursor-pointer";
        btn.onclick = onClickHandler;
      }
      return btn;
    };

    // Hàm xử lý chung khi chuyển trang
    const changePageTo = (newPage) => {
      currentPage = newPage;
      applyFiltersAndSort();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 1. Nút "Về trang đầu" (<<)
    container.appendChild(
      createButton(
        '<i class="fa-solid fa-angles-left"></i>',
        page === 0,
        false,
        () => changePageTo(0),
      ),
    );

    // 2. Nút "Trước" (< Trước)
    container.appendChild(
      createButton(
        '<i class="fa-solid fa-angle-left"></i> &nbsp;Trước',
        page === 0,
        false,
        () => changePageTo(page - 1),
      ),
    );

    // TÍNH TOÁN CỬA SỔ HIỂN THỊ TRANG (Hiển thị tối đa 5 nút số như hình)
    const maxVisiblePages = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Dịch chuyển lại startPage nếu các trang cuối bị thiếu nút (để luôn hiện đủ 5 nút)
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // 3. Các nút số (1, 2, 3, 4, 5...)
    for (let i = startPage; i <= endPage; i++) {
      container.appendChild(
        createButton(i + 1, false, i === page, () => changePageTo(i)),
      );
    }

    // 4. Nút "Sau" (Sau >)
    container.appendChild(
      createButton(
        'Sau&nbsp; <i class="fa-solid fa-angle-right"></i>',
        page === totalPages - 1,
        false,
        () => changePageTo(page + 1),
      ),
    );

    // 5. Nút "Về trang cuối" (>>)
    container.appendChild(
      createButton(
        '<i class="fa-solid fa-angles-right"></i>',
        page === totalPages - 1,
        false,
        () => changePageTo(totalPages - 1),
      ),
    );
  }

  // Mở trang lên là Auto lấy sách đã duyệt trước
  applyFiltersAndSort();
});
