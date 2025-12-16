const Base_Url = "http://localhost:7000"; // URL backend

let editAttached = false;

export async function initEditLeader(){
    const id = localStorage.getItem('leaderId');
    if(!id) return;

    try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${Base_Url}/api/employee/v1/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const result = await response.json();
        if(result.statusCode === 200){
            const data = result.data;
            document.getElementById('employeeCode1').value = data.code;
            document.getElementById('fullName1').value = data.fullName;
            document.getElementById('email1').value = data.email;
            document.getElementById('birthday1').value = data.birthday;
            document.getElementById('gender1').value = data.gender;
            document.getElementById('address1').value = data.address;
            document.getElementById('phone1').value = data.phone;
        } else {
            showToast("Lấy thông tin thất bại", "error");
            return null;
        }
    } catch(error){
        console.error(error);
        return null;
    }
    if(!editAttached){
        attachEditSubmit();
        editAttached = true;
    }
}

function attachEditSubmit(){
     const btn = document.getElementById('editLeader');

    btn.addEventListener('click', async (event) => {
        event.preventDefault();

        const id = localStorage.getItem('leaderId');
        if(!id) return;

        const token = localStorage.getItem('jwt');

        const data = {
            code: document.getElementById('employeeCode1').value.trim(),
            fullName: document.getElementById('fullName1').value.trim(),
            email: document.getElementById('email1').value.trim(),
            birthDay: document.getElementById('birthday1').value,
            gender: document.getElementById('gender1').value,
            address: document.getElementById('address1').value,
            phone: document.getElementById('phone1').value.trim(),
            role: "TeamLeader"
        };

        // validate nhanh
        if(!data.code || !data.fullName || !data.email || !data.phone){
            alert("Vui lòng điền đầy đủ các trường bắt buộc");
            return;
        }

        try {
            const res = await fetch(`${Base_Url}/api/employee/v1/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if(result.statusCode === 200){
                localStorage.removeItem('leaderId');
                localStorage.setItem("toastMessage", "Cập nhật thành công");
                localStorage.setItem("toastType", "success");
                localStorage.setItem("redirectPage", "pages/team-leader-management.html");
                window.location.href = "index.html";
            } else {
                showToast("Cập nhật thất bại", "error");
            }
        } catch (e){
            console.error(e);
        }
    });
}
