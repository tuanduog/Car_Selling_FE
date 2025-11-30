const Base_Url = "http://localhost:7000"; // URL backend

export async function getAccount(page = 0, keyword, status, role) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/account-manager/v1?page=${page}&keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}&role=${role}`, {
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
export async function loadAccountManagement(page = 0){
    currentPage = page;
    const searchInput = document.getElementById('searchAccount');
    const tableBody = document.querySelector("#account-table tbody");
    const statusSelect = document.getElementById('accountStatus');
    const roleSelect = document.getElementById('accountRole');
    const paginationContainer = document.getElementById('pagination');

    if(!searchInput || !tableBody || !statusSelect || !roleSelect || !paginationContainer) {
        console.log('account-management HTML chưa load xong');
        return;
    }

    if (!searchInput.dataset.listenerAttached) { 
        searchInput.addEventListener('input', () => loadAccountManagement(0));
        searchInput.dataset.listenerAttached = true; 
    }

    if (!statusSelect.dataset.listenerAttached) { 
        statusSelect.addEventListener('change', () => loadAccountManagement(0));
        statusSelect.dataset.listenerAttached = true; 
    } 

    if (!roleSelect.dataset.listenerAttached) { 
        roleSelect.addEventListener('change', () => loadAccountManagement(0));
        roleSelect.dataset.listenerAttached = true; 
    }

    const keyword = searchInput.value || "";
    const statusStr = document.getElementById('accountStatus').value || "";
    const role = document.getElementById("accountRole").value || "";

    let status = "";
    if(statusStr === "active"){
        status = 1;
    } else if(statusStr === "banned"){
        status = 0;
    }

    try {
        const accounts = await getAccount(page, keyword, status, role);
        console.log('testapi:',accounts.data.content);
        renderTable(accounts.data.content);

        renderPagination(accounts.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch tài khoản:", error);
    }
}

async function handleToggleLock(id){
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/account-manager/v1/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updated = await response.json();
    alert("Cập nhật thành công");

    await loadAccountManagement(currentPage);
}
window.handleToggleLock = handleToggleLock;

function renderTable(accounts){
    const tbody = document.querySelector("#account-table tbody");
    tbody.innerHTML = accounts.map(acc => `
        <tr>
            <td>${acc.fullName}</td>
            <td>${acc.email}</td>
            <td>${acc.role}</td>
            <td>${acc.createdAt ? acc.createdAt : ""}</td>
            <td>${acc.updatedAt ? acc.updatedAt : ""}</td>
            <td>
                <span class="badge ${acc.status == 1 ? "bg-success" : "bg-warning text-dark"}">
                    ${acc.status == 1 ? "Hoạt động" : "Ngừng hoạt động"}
                </span>
            </td>
            <td class="text-center d-flex gap-2 justify-content-center">
                <!-- Nút khóa/mở khóa -->
                <button 
                    class="btn btn-sm ${acc.status === 1 ? 'btn-outline-danger' : 'btn-outline-success'}"
                    onclick="handleToggleLock(${acc.id})"
                >
                    <i class="bi ${acc.status === 1 ? 'bi-lock' : 'bi-unlock'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPagination(totalPages, current){
    const container = document.getElementById('pagination');
    container.innerHTML = "";

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.textContent = "Previous";
    prevBtn.disabled = current === 0;
    prevBtn.addEventListener('click', () => loadAccountManagement(current - 1));
    container.appendChild(prevBtn);

    // Nút từng trang
    for(let i = 0; i < totalPages; i++){
        const btn = document.createElement('button');
        btn.textContent = (i + 1);
        if(i === current) btn.disabled = true;
        btn.addEventListener('click', () => loadAccountManagement(i));
        container.appendChild(btn);
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.textContent = "Next";
    nextBtn.disabled = current === totalPages - 1;
    nextBtn.addEventListener('click', () => loadAccountManagement(current + 1));
    container.appendChild(nextBtn);
}