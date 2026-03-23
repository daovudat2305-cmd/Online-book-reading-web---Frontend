// Đợi HTML tải xong thì mới chạy code JS
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. "Bắt" lấy 3 phần tử HTML thông qua ID
    const btnSearch = document.getElementById("btn-search");
    const emptyState = document.getElementById("empty-state");
    const searchResults = document.getElementById("search-results");

    // 2. Lắng nghe sự kiện "click" vào nút Tìm kiếm
    btnSearch.addEventListener("click", function() {
        
        // Thêm class 'hidden' để giấu cục báo rỗng đi
        emptyState.classList.add("hidden");
        
        // Xóa class 'hidden' để hiện lưới sách lên
        searchResults.classList.remove("hidden");
        
    });
});