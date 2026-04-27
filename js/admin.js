document.addEventListener("DOMContentLoaded", function () {
  // hiện thị thông báo thành công từ trang đăng nhập
  const message = sessionStorage.getItem("toastMessage");
  const type = sessionStorage.getItem("toastType");

  if (message && type) {
    showToast(message, type);

    sessionStorage.removeItem("toastMessage");
    sessionStorage.removeItem("toastType");
  }
});

// Hàm xử lý khi bấm Đăng xuất
function logout() {
  // Chỉ cần xóa Token khỏi LocalStorage
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("username");
  localStorage.removeItem("role");

  // Tải lại trang chủ để giao diện cập nhật lại thành nút Đăng nhập
  window.location.href = "login.html";
}
