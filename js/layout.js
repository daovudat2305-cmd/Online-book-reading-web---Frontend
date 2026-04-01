document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    
    // GỌI API ĐỂ LOAD HEADER 
    if (headerPlaceholder) {
        fetch('admin-header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                // ✨ Tui đã xóa dòng setupAdminHeaderEvents() ở đây để nó không gọi nhầm nữa
            });
    }
});

