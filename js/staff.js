const Base_Url = "http://localhost:7000"; // URL backend

export async function getStaff(page = 0, keyword, status) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/employee/v1?page=${page}&keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}&role=Staff`, {
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

let currentPage = 0;
export async function loadStaffManagement(page = 0){
    currentPage = page;
    const searchInput = document.getElementById('searchStaff');
    const tableBody = document.querySelector("#staff-table tbody");
    const statusSelect = document.getElementById('staffStatus');
    const paginationContainer = document.getElementById('pagination');
    console.log(paginationContainer);

    if(!searchInput || !tableBody || !statusSelect || !paginationContainer) {
        console.log('staff-management HTML chưa load xong');
        return;
    }

    if (!searchInput.dataset.listenerAttached) { 
        searchInput.addEventListener('input', () => loadStaffManagement(0));
        searchInput.dataset.listenerAttached = true; 
    }

    if (!statusSelect.dataset.listenerAttached) { 
        statusSelect.addEventListener('change', () => loadStaffManagement(0));
        statusSelect.dataset.listenerAttached = true; 
    } 

    const keyword = searchInput.value || "";
    const statusStr = document.getElementById('staffStatus').value || "";
    let status = "";
    if(statusStr === "inactive"){
        status = 0;
    } else if(statusStr === "active"){
        status = 1;
    }

    try {
        const staffs = await getStaff(page, keyword, status);
        renderTable(staffs.data.content);

        attachTableEvents();

        renderPagination(staffs.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch staff:", error);
    }
}

const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${Base_Url}/api/employee/delete/v1/${id}`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    const result = await response.json();
    if(result.statusCode === 200){
        showToast("Xóa thành công", "success");
        window.location.reload();
    } else {
        showToast("Xóa thất bại", "error");
    }
}

const goToEdit = (id) => {
    localStorage.setItem('staffId', id);
    window.loadPage(`/section/staff/edit-staff.html`);
}

function attachTableEvents() {
    const tbody = document.querySelector("#staff-table tbody");

    tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr) return;
        const id = tr.dataset.id;

        if (e.target.closest(".delete-btn")) {
            handleDelete(id);
        }

        if (e.target.closest(".edit-btn")) {
            goToEdit(id);
        }
    });
}

function renderTable(staffs){
    const tbody = document.querySelector("#staff-table tbody");
    tbody.innerHTML = staffs.map(staff => `
        <tr data-id="${staff.id}">
            <td>${staff.code}</td>
            <td>${staff.fullName}</td>
            <td>${staff.email}</td>
            <td>${staff.phone ? staff.phone : ''}</td>
            <td>${staff.managerFullName ? staff.managerFullName : ''}</td>
            <td>
                <span class="badge ${staff.status == 1 ? "bg-success" : "bg-warning text-dark"}">
                    ${staff.status == 1 ? "Hoạt động" : "Ngừng hoạt động"}
                </span>
            </td>
            <td class="text-center d-flex gap-2 justify-content-center">
                <button class="btn btn-outline-primary btn-sm me-2 edit-btn" title="Chỉnh sửa">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm delete-btn" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPagination(totalPages, current) {
    const container = document.getElementById('pagination');
    container.innerHTML = "";

    const createBtn = (iconHtml, page, disabled = false, isActive = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = iconHtml;
        btn.disabled = disabled;
        if (isActive) btn.classList.add('active');
        btn.addEventListener('click', () => loadStaffManagement(page));
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