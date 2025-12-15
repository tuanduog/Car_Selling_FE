const Base_Url = "http://localhost:7000"; // URL backend

export async function getLeader(page = 0, keyword, status) {
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

let currentPage = 0;
export async function loadLeaderManagement(page = 0){
    currentPage = page;
    const searchInput = document.getElementById('searchLeader');
    const tableBody = document.querySelector("#leader-table tbody");
    const statusSelect = document.getElementById('leaderStatus');
    const paginationContainer = document.getElementById('pagination');
    console.log(paginationContainer);

    if(!searchInput || !tableBody || !statusSelect || !paginationContainer) {
        console.log('leader-management HTML chưa load xong');
        return;
    }

    if (!searchInput.dataset.listenerAttached) { 
        searchInput.addEventListener('input', () => loadLeaderManagement(0));
        searchInput.dataset.listenerAttached = true; 
    }

    if (!statusSelect.dataset.listenerAttached) { 
        statusSelect.addEventListener('change', () => loadLeaderManagement(0));
        statusSelect.dataset.listenerAttached = true; 
    } 

    const keyword = searchInput.value || "";
    const statusStr = document.getElementById('leaderStatus').value || "";
    let status = "";
    if(statusStr === "inactive"){
        status = 0;
    } else if(statusStr === "active"){
        status = 1;
    }

    try {
        const leaders = await getLeader(page, keyword, status);
        renderTable(leaders.data.content);

        renderPagination(leaders.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch leader:", error);
    }
}

// delete
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

// edit
const handleEdit = async (id) => {
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
            return result.data;
        } else {
            showToast("Lấy thông tin thất bại", "error");
            return null;
        }
    } catch(error){
        console.error(error);
        return null;
    }
}

function attachTableEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.closest("tr").dataset.id;
            handleDelete(id);
        });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.closest("tr").dataset.id;
            handleEdit(id);
        });
    });
}

function renderTable(leaders){
    const tbody = document.querySelector("#leader-table tbody");
    tbody.innerHTML = leaders.map(leader => `
        <tr data-id="${leader.id}">
            <td>${leader.code}</td>
            <td>${leader.fullName}</td>
            <td>${leader.email}</td>
            <td>${leader.phone ? leader.phone : ''}</td>
            <td>
                <span class="badge ${leader.status == 1 ? "bg-success" : "bg-warning text-dark"}">
                    ${leader.status == 1 ? "Hoạt động" : "Ngừng hoạt động"}
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
    attachTableEvents();
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