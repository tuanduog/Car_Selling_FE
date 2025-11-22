document.getElementById('submitButton').addEventListener('click', async function(event) {
    event.preventDefault();
    const fullName = document.getElementById('yourFullname').value;
    const email = document.getElementById('yourEmail').value;
    const password = document.getElementById('yourPassword').value;
    const confirmPassword = document.getElementById('yourConfirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms');

    if(fullName === '' || email === '' || password === ''){
        alert('Tất cả các trường đều là bắt buộc');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        alert('Email không hợp lệ!');
        return;
    }

    if(password !== confirmPassword) {
        alert('Xác nhận mật khẩu không khớp!');
        return;
    }

    if(!acceptTerms.checked){
        alert('Bạn cần phải dồng ý với các điều khoản và điều kiện');
        return;
    }

    const response = await fetch(`${Base_Url}/api/register/v1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, email, password })
    })

    const result = await response.json();
    if(result.statusCode === 200) {
        alert(result.message);
        window.location.href = 'pages-login.html';
    } else {
        alert('Đăng ký thất bại: ' + result.message);
    }
});
