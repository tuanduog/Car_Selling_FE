document.getElementById('submitLogin').addEventListener('click', async function(event) {
    event.preventDefault();
    const email = document.getElementById('yourEmail').value;
    const password = document.getElementById('yourPassword').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
        alert('Email không hợp lệ!');
        return;
    }

    const response = await fetch(`${Base_Url}/api/login/v1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    console.log(response);
    const result = await response.json();
    if(result.statusCode === 200) {
        alert(result.message);
        const data = result.data;
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('email', data.email);
        localStorage.setItem('fullName', data.fullName);
        localStorage.setItem('role', data.role);
        window.location.href = 'index.html';
    } else {
        alert('Đăng nhập thất bại: ' + result.message);
    }
})

// logout
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout');

  if(logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      // Xóa JWT hoặc bất kỳ token nào lưu
      localStorage.removeItem('jwt');

      // Redirect về trang login
      window.location.href = 'pages-login.html';
    });
  } else {
    console.error('Logout button not found!');
  }
});

