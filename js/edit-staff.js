const Base_Url = "http://localhost:7000"; // URL backend

//================ modal leader ==================

let page = 0;
const status = 1;
let selectedManager = null;

async function getLeader(page = 0, keyword, status) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/employee/v1?page=${page}&keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}&role=Teamleader`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function loadLeaderPopup(newPage = 0) {
    page = newPage;
    const searchInput = document.getElementById("managerSearch");
    if (!searchInput) return;

    const keyword = searchInput.value.trim();

    try {
        const leaders = await getLeader(page, keyword, status);
        renderLeaderTable(leaders.data.content);
        renderPagination(leaders.data.totalPages, Number(page));
    } catch(error){
        console.error("Lỗi khi fetch leader:", error);
    }
}

function renderLeaderTable(leaders){
    const tbody = document.getElementById("managerTableBody");

    tbody.innerHTML = leaders.map(leader => {
        const checked = selectedManager && leader.id == selectedManager.id ? "checked" : "";
        return `
            <tr data-id="${leader.id}">
                <td>${leader.code}</td>
                <td>${leader.fullName}</td>
                <td>${leader.email}</td>
                <td>${leader.phone ? leader.phone : ''}</td>
                <td class="text-center">
                    <input 
                        type="radio" 
                        name="managerRadio"
                        value="${leader.id}"
                        data-code="${leader.code}"
                        data-name="${leader.fullName}"
                        style="cursor: pointer; transform: scale(1.4);"
                        ${checked}
                    >
                </td>
            </tr>
        `;
    }
    ).join('');
}

document.getElementById("managerTableBody")
.addEventListener("change", (e) => {
    if (e.target.name === "managerRadio") {
        selectedManager = {
            id: e.target.value,
            code: e.target.dataset.code,
            fullName: e.target.dataset.name
        };
    }
});

document.getElementById("confirmManager")
.addEventListener("click", () => {

    if (!selectedManager) {
        alert("Vui lòng chọn người quản lý");
        return;
    }

    document.getElementById("manager").value =
        `${selectedManager.fullName}`;

    document.getElementById("managerId").value =
        selectedManager.id;

    const modalEl = document.getElementById("managerModal");
    bootstrap.Modal.getInstance(modalEl).hide();
});

function renderPagination(totalPages, current) {
    const container = document.getElementById('tablePagination');
    container.innerHTML = "";

    const createBtn = (iconHtml, page, disabled = false, isActive = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = iconHtml;
        btn.disabled = disabled;
        if (isActive) btn.classList.add('active');
        btn.addEventListener('click', () => loadLeaderPopup(page));
        return btn;
    };

    container.appendChild(
        createBtn(`<i class="bi bi-chevron-bar-left"></i>`, 0, current === 0)
    )

    // Previous
    container.appendChild(
        createBtn(`<i class="bi bi-chevron-left"></i>`, current - 1, current === 0)
    );

    const delta = 2;
    let start = Math.max(0, current - delta);
    let end = Math.min(totalPages - 1, current + delta);

    // luôn có trang đầu
    if (start > 0) {
        container.appendChild(createBtn(1, 0));
        if (start > 1) {
            container.appendChild(document.createTextNode(" ... "));
        }
    }

    // các trang ở giữa
    for (let i = start; i <= end; i++) {
        container.appendChild(
            createBtn(i + 1, i, false, i === current)
        );
    }

    // luôn có trang cuối
    if (end < totalPages - 1) {
        if (end < totalPages - 2) {
            container.appendChild(document.createTextNode(" ... "));
        }
        container.appendChild(
            createBtn(totalPages, totalPages - 1)
        );
    }

    // Next
    container.appendChild(
        createBtn(`<i class="bi bi-chevron-right"></i>`, current + 1, current === totalPages - 1)
    )

    container.appendChild(
        createBtn(`<i class="bi bi-chevron-bar-right"></i>`, totalPages - 1, current === totalPages - 1)
    );
}

//================ end ==================

let editAttached = false;

export async function initEditStaff(){
    const id = localStorage.getItem('staffId');
    if(!id) return;

    const modal = document.getElementById("managerModal");
    if (modal && !modal.dataset.loaded) {
        modal.addEventListener("shown.bs.modal", () => {
            loadLeaderPopup(0);
        });
        modal.dataset.loaded = "true";
    }

    const searchInput = document.getElementById("managerSearch");
    if (searchInput && !searchInput.dataset.listenerAttached) {
        let timeout;
        searchInput.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                loadLeaderPopup(0);
            }, 300);
        });
        searchInput.dataset.listenerAttached = "true";
    }

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
            document.getElementById('manager').value = data.managerFullName;
            document.getElementById('managerId').value = data.managerId;
            selectedManager = {
                id: data.managerId,
                code: data.managerCode,
                fullName: data.managerFullName
            };
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
    const btn = document.getElementById('editStaff');

    btn.addEventListener('click', async (event) => {
        event.preventDefault();

        const id = localStorage.getItem('staffId');
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
            role: "Staff",
            managerId: selectedManager?.id
        };

        // validate nhanh
        if(!data.code || !data.fullName || !data.email || !data.phone || !selectedManager){
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
                localStorage.removeItem('staffId');
                localStorage.setItem("toastMessage", "Cập nhật thành công");
                localStorage.setItem("toastType", "success");
                localStorage.setItem("redirectPage", "pages/staff-management.html");
                window.location.href = "index.html";
            } else {
                showToast("Cập nhật thất bại", "error");
            }
        } catch (e){
            console.error(e);
        }
    });
}
