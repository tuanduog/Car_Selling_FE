const Base_Url = "http://localhost:7000"; // URL backend
import { getLeader } from "./leader";

//================ modal leader ==================

let page = 0;
let keyword = "";
const status = 1

async function loadLeaderPopup() {
    try {
        const leaders = await getLeader(page, keyword, status);
        renderLeaderTable(leaders.data.content);
        renderPagination(leaders.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch leader:", error);
    }
}

function renderLeaderTable(leaders){
    const tbody = document.getElementById("managerTableBody");

    tbody.innerHTML = leaders.map(leader => `
        <tr data-id="${leader.id}">
            <td>${leader.code}</td>
            <td>${leader.fullName}</td>
            <td>${leader.email}</td>
            <td>${leader.phone ? leader.phone : ''}</td>
            <td class="text-center d-flex gap-2 justify-content-center">
                
            </td>
        </tr>
    `).join('');
}

function renderPagination(totalPages, current){
    const container = document.getElementById('tablePagination');
    container.innerHTML = "";

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.disabled = current === 0;
    prevBtn.addEventListener('click', () => loadLeaderManagement(current - 1));
    container.appendChild(prevBtn);

    // Nút từng trang
    for(let i = 0; i < totalPages; i++){
        const btn = document.createElement('button');
        btn.textContent = (i + 1);
        if(i === current) btn.disabled = true;
        btn.addEventListener('click', () => loadLeaderManagement(i));
        container.appendChild(btn);
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.disabled = current === totalPages - 1;
    nextBtn.addEventListener('click', () => loadLeaderManagement(current + 1));
    container.appendChild(nextBtn);
}

document.getElementById("managerModal")
    ?.addEventListener("shown.bs.modal", () => {
        loadLeaderPopup();
    });

//================ end ==================

export async function initAddStaff() {
    const btn = document.getElementById('addStaff');
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

        const data = { code, fullName, email, birthDay, gender, address, phone, role: "Staff" };

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
                localStorage.setItem("redirectPage", "pages/staff-management.html");
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