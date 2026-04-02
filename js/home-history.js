//kiem tra dang nhap
document.addEventListener('DOMContentLoaded', function(){
    const token = localStorage.getItem('jwtToken')
    const guestHistory = document.getElementById('guest-history')
    const userHistory = document.getElementById('user-history')

    if(token) {
        //nếu có
        guestHistory.style.display = 'none' 
        userHistory.style.display = 'flex'
    }
    else {
        guestHistory.style.display = 'block'
        userHistory.style.display = 'none'
    }
})