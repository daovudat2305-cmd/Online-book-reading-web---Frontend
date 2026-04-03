document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    
    // GỌI API ĐỂ LOAD HEADER 
    if (headerPlaceholder) {
        fetch('admin-header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
            });
    }
});

