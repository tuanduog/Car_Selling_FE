function initProfilePage() {
    const btn = document.getElementById('submitChangePassword');
        if(!btn) return;
        
        btn.addEventListener('click', async function (event) {
        event.preventDefault();
        const email = localStorage.getItem('email');
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const renewPassword = document.getElementById('renewPassword').value;

        if(currentPassword === '' || newPassword === '' || renewPassword === ''){
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if(newPassword !== renewPassword){
            alert('Xác nhận mật khẩu mới không khớp');
            return;
        }

        const response = await updatePassword(email, currentPassword, newPassword);
        console.log(response);
        const result = response.json();
        console.log(result);
        if(result.statusCode === 200){
            alert(result.message);
            document.getElementById('currentPassword').textContent = "";
            document.getElementById('newPassword').textContent = "";
            document.getElementById('renewPassword').textContent = "";
            return;
        } else {
            alert(result.message);
        }
    });
}