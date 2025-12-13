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

        renderPagination(staffs.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch staff:", error);
    }
}

// function attachTableEvents() {
//     document.querySelectorAll(".delete-btn").forEach(btn => {
//         btn.addEventListener("click", (e) => {
//             const id = e.target.closest("tr").dataset.id;
//             handleDelete(id);
//         });
//     });

//     document.querySelectorAll(".edit-btn").forEach(btn => {
//         btn.addEventListener("click", (e) => {
//             const id = e.target.closest("tr").dataset.id;
//             // TODO: handleEdit(id);
//             console.log("Edit:", id);
//         });
//     });
// }

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
    // attachTableEvents();
}

function renderPagination(totalPages, current){
    const container = document.getElementById('pagination');
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