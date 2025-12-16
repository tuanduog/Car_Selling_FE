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

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

function renderTable(accounts){
    const tbody = document.querySelector("#account-table tbody");
    tbody.innerHTML = accounts.map(acc => `
        <tr>
            <td>${acc.fullName}</td>
            <td>${acc.email}</td>
            <td>${acc.role == "Staff" ? "Nhân viên" : acc.role == "Customer" ? "Khách hàng" : "Trưởng nhóm"}</td>
            <td>${acc.createdAt ? formatDate(acc.createdAt) : ""}</td>
            <td>${acc.updatedAt ? formatDate(acc.updatedAt) : ""}</td>
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

function renderPagination(totalPages, current) {
    const container = document.getElementById('pagination');
    container.innerHTML = "";

    const createBtn = (iconHtml, page, disabled = false, isActive = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = iconHtml;
        btn.disabled = disabled;
        if (isActive) btn.classList.add('active');
        btn.addEventListener('click', () => loadAccountManagement(page));
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
