document.addEventListener("DOMContentLoaded", function() {
    // PHẦN 1: TẢI LỊCH SỬ ĐĂNG SÁCH
    loadBookHistory();

    // PHẦN 2: XỬ LÝ ĐĂNG SÁCH MỚI
    const btnSubmit = document.getElementById('btnSubmitBook');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', function(event) {
            event.preventDefault(); // Ngăn trình duyệt load lại trang

            // 1. Lấy dữ liệu từ các ô nhập liệu cơ bản
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            const totalPages = document.getElementById('totalPages').value.trim();
            const type = document.getElementById('type').value;
            
            const coverImageFile = document.getElementById('coverImage').files[0];
            const pdfFile = document.getElementById('pdfFile').files[0];
            
            // LẤY DANH SÁCH THỂ LOẠI (CHECKBOX)
            const checkedCategories = document.querySelectorAll('input[name="categories"]:checked');
            const categoryIds = Array.from(checkedCategories).map(cb => cb.value);

            // Lấy Token từ két sắt
            const token = localStorage.getItem('jwtToken'); 
            console.log("🎟️ VÉ ĐANG GỬI ĐI LÀ:", token); 

            // Kiểm tra nếu PDF đang trong quá trình đếm trang
            if (totalPages === "Đang đếm số trang...") {
                alert("Hệ thống đang xử lý file PDF, vui lòng chờ trong giây lát!");
                return;
            }

            // 2. Chặn lỗi rỗng (Validation)
            if (!title || !description || !totalPages) {
                alert("Vui lòng điền đầy đủ Tiêu đề, Mô tả và Số trang!");
                return;
            }

            if (!coverImageFile || !pdfFile) {
                alert("Vui lòng đính kèm đầy đủ Bìa sách và File sách (PDF)!");
                return;
            }

            // Kiểm tra xem tác giả có quên chọn Thể loại không
            if (categoryIds.length === 0) {
                alert("Vui lòng chọn ít nhất 1 thể loại cho cuốn sách của bạn!");
                return;
            }

            // Đổi trạng thái nút bấm để tránh click đúp
            btnSubmit.innerText = "Đang tải lên...";
            btnSubmit.disabled = true;

            // 3. Gom hàng vào FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('totalPages', totalPages);
            formData.append('type', type);
            formData.append('coverImage', coverImageFile);
            formData.append('pdfFile', pdfFile);

            // Gắn mảng danh sách ID thể loại vào FormData
            categoryIds.forEach(id => {
                formData.append('categoryIds', id);
            });

            // 4. Gọi API
            fetch(`http://localhost:8080/api/author/books/create`, { 
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            })
            .then(async response => {
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    const errMessage = errData.error || errData.message || "Có lỗi xảy ra ở máy chủ";
                    throw new Error(errMessage);
                }
                return response.json();
            })
            .then(data => {
                alert("🎉 Đăng sách thành công!");
                
                // Xóa trắng form sau khi đăng xong
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                
                const totalPagesInput = document.getElementById('totalPages');
                totalPagesInput.value = '';
                totalPagesInput.disabled = false; // Mở khóa lại ô số trang
                
                document.getElementById('coverImage').value = '';
                document.getElementById('pdfFile').value = '';
                
                // Bỏ tích tất cả các ô Thể loại
                checkedCategories.forEach(cb => cb.checked = false);

                // CẬP NHẬT LẠI BẢNG LỊCH SỬ NGAY LẬP TỨC
                loadBookHistory();
            })
            .catch(error => {
                alert("Lỗi: " + error.message);
                console.error('Error: ', error);
            })
            .finally(() => {
                // Trả lại trạng thái ban đầu cho nút bấm
                btnSubmit.innerText = "Đăng sách";
                btnSubmit.disabled = false;
            });
        });
    }

    // PHẦN 3: GÁN SỰ KIỆN LỌC (NGÀY & TRẠNG THÁI)
    const filterInput = document.getElementById('filter-date-input');
    const filterStatus = document.getElementById('filter-status-select');

    if (filterInput) filterInput.addEventListener('change', applyFilters);
    if (filterStatus) filterStatus.addEventListener('change', applyFilters);
});

// 1. BIẾN TOÀN CỤC LƯU DANH SÁCH SÁCH
let allMyBooks = []; 

// 2. HÀM TẢI LỊCH SỬ ĐĂNG SÁCH TỪ API
async function loadBookHistory() {
    const token = localStorage.getItem('jwtToken');
    const tbody = document.getElementById('history-table-body');

    if (!tbody || !token) return;

    try {
        const response = await fetch('http://localhost:8080/api/author/books/my-history', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Không thể tải lịch sử');
        
        allMyBooks = await response.json();

        // ✨ SẮP XẾP THỜI GIAN (Mới nhất lên đầu)
        allMyBooks.sort((a, b) => {
            let dateA = new Date(a.createdAt || a.createdDate || 0);
            let dateB = new Date(b.createdAt || b.createdDate || 0);
            return dateB - dateA;
        });

        renderBookTable(allMyBooks);
    } catch (error) {
        console.error("❌ Lỗi hiển thị bảng:", error);
    }
}

// HÀM LỌC TỔNG HỢP (KẾT HỢP NGÀY VÀ TRẠNG THÁI)
function applyFilters() {
    const dateValue = document.getElementById('filter-date-input')?.value; 
    const statusValue = document.getElementById('filter-status-select')?.value; 

    const filteredBooks = allMyBooks.filter(book => {
        // Lọc theo ngày
        let matchDate = true;
        if (dateValue) {
            let d = new Date(book.createdAt || book.createdDate);
            let bookDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            matchDate = (bookDateStr === dateValue);
        }

        // Lọc theo trạng thái
        let matchStatus = true;
        if (statusValue && statusValue !== 'all') {
            matchStatus = (book.status == statusValue);
        }

        return matchDate && matchStatus;
    });

    renderBookTable(filteredBooks);
}

// 3. HÀM VẼ BẢNG RA MÀN HÌNH
function renderBookTable(booksToRender) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (booksToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Không tìm thấy sách phù hợp.</td></tr>`;
        return;
    }

    booksToRender.forEach(book => {
        let statusText = '', statusColor = '', cursorClass = '', clickEvent = '';

        if (book.status == 0) {
            statusText = 'Đang chờ duyệt'; statusColor = 'text-yellow-500';
        } else if (book.status == 1) {
            statusText = 'Đã duyệt'; statusColor = 'text-green-500';
        } else if (book.status == 2) {
            statusText = 'Bị từ chối duyệt'; statusColor = 'text-orange-600';
        } else if (book.status == 3) {
            statusText = 'Đã xóa (Bấm để xem lý do)'; 
            statusColor = 'text-red-700 underline decoration-dotted';
            cursorClass = 'cursor-pointer';
            const reason = book.message || "Admin không để lại lý do cụ thể.";
            clickEvent = `onclick="alert('Lý do xóa sách: ${reason}')"`;
        }

        let dateStr = new Date(book.createdAt || book.createdDate).toLocaleDateString('vi-VN');

        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50 transition text-sm";
        tr.innerHTML = `
            <td class="p-3 text-gray-500 text-xs">#${book.bookId.substring(0,8)}...</td>
            <td class="p-3 font-semibold text-n-800">${book.title}</td>
            <td class="p-3">${dateStr}</td>
            <td class="p-3">
                <span class="font-bold ${statusColor} ${cursorClass}" ${clickEvent}>
                    ${statusText}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// HÀM TỰ ĐỘNG ĐẾM SỐ TRANG PDF
const pdfInput = document.getElementById('pdfFile');
if (pdfInput) {
    pdfInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const totalPagesInput = document.getElementById('totalPages');

        if (file && file.type === 'application/pdf') {
            totalPagesInput.type = "text"; 
            totalPagesInput.value = "Đang đếm số trang...";
            totalPagesInput.disabled = true;

            const reader = new FileReader();
            reader.onload = function(e) {
                const typedarray = new Uint8Array(e.target.result);
                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    totalPagesInput.type = "number";
                    totalPagesInput.value = pdf.numPages;
                    totalPagesInput.disabled = true;
                }).catch(err => {
                    alert("Lỗi đọc PDF, vui lòng tự nhập số trang.");
                    totalPagesInput.type = "number";
                    totalPagesInput.value = '';
                    totalPagesInput.disabled = false;
                });
            };
            reader.readAsArrayBuffer(file);
        }
    });
}