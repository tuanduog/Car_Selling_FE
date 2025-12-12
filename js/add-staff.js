const Base_Url = "http://localhost:7000"; // URL backend

export async function initAddLeader() {
    const btn = document.getElementById('addLeader');
    console.log('Button found:', btn);
    if(!btn) return;

    btn.addEventListener('click', async function (event) {
        event.preventDefault();
        const token = localStorage.getItem('jwt');

        const code = document.getElementById('employeeCode1')?.value.trim() || '';
        const fullName = document.getElementById('fullName1')?.value.trim() || '';
        const email = document.getElementById('email1')?.value.trim() || '';
        const birthDay = document.getElementById('birthday1')?.value.trim() || '';
        const gender = document.getElementById('gender1')?.value.trim() || '';
        const address = document.getElementById('address1')?.value.trim() || '';
        const phone = document.getElementById('phone1')?.value.trim() || '';

        if(!code || !fullName || !email || !phone) { 
            alert('Vui lòng điền đầy đủ các trường bắt buộc (*)'); 
            return; 
        }
        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if(!emailPattern.test(email)) { 
            alert('Email không hợp lệ');
            return; 
        }
        // Validate phone
        if(phone && !/^\d{9,15}$/.test(phone)) { 
            alert('Số điện thoại không hợp lệ (9-15 chữ số)'); 
            return; 
        }

        const data = { code, fullName, email, birthDay, gender, address, phone, role: "TeamLeader" };

        try {
            const response = await fetch(`${Base_Url}/api/employee/v1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(result.statusCode === 200){
                localStorage.setItem("toastMessage", "Thêm thành công");
                localStorage.setItem("toastType", "success");
                localStorage.setItem("redirectPage", "pages/team-leader-management.html");
                window.location.href = "index.html";
            } else {
                showToast("Thêm thất bại", "error");
                return;
            }
        } catch(error){
            console.error(error);
        }
    })
}