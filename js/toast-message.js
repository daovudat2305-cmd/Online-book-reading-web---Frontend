function showToast(message, type="warning") {
    const container = document.getElementById('toast-container')

    const toast = document.createElement('div')

    let bgColor = ""
    if(type === 'success') bgColor = "bg-success"
    else if(type === 'error') bgColor = "bg-error"
    else if(type === 'warning') bgColor = "bg-warning"
    else if(type === 'info') bgColor = "bg-p-300"

    toast.className = `${bgColor} text-n-800 px-4 py-2 rounded-lg shadow-lg transition duration-300 opacity-0 translate-x-10`
    toast.innerText = message

    container.appendChild(toast)

    // hiệu ứng hiện
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-x-10')
    }, 100)

    // tự ẩn sau 3s
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-x-10");
        setTimeout(() => toast.remove(), 300);
    }, 3000)
}
