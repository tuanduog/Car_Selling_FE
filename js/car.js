const Base_Url = "http://localhost:7000"; // URL backend

export async function getCar(page = 0, keyword) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/vehicle/v1?page=${page}&keyword=${encodeURIComponent(keyword)}`, {
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
export async function loadCarManagement(page = 0){
    currentPage = page;
    const searchInput = document.getElementById('searchCar');
    const tableBody = document.querySelector("#car-table tbody");
    const paginationContainer = document.getElementById('pagination');
    console.log(paginationContainer);

    if(!searchInput || !tableBody || !paginationContainer) {
        console.log('car-management HTML chưa load xong');
        return;
    }

    if (!searchInput.dataset.listenerAttached) { 
        searchInput.addEventListener('input', () => loadCarManagement(0));
        searchInput.dataset.listenerAttached = true; 
    }

    const keyword = searchInput.value || "";

    try {
        const cars = await getCar(page, keyword);
        renderTable(cars.data.content);

        attachTableEvents();

        renderPagination(cars.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch car:", error);
    }
}

// delete
const handleDelete = async (id) => {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${Base_Url}/api/vehicle/delete/v1/${id}`, {
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

function goToEdit(id){
    localStorage.setItem('carId', id);
    window.loadPage(`/section/car/edit-car.html`);
}

function attachTableEvents() {
    const tbody = document.querySelector("#car-table tbody");

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

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

function renderTable(cars){
    const tbody = document.querySelector("#car-table tbody");
    tbody.innerHTML = cars.map(car => `
        <tr data-id="${car.id}">
            <td>${car.code}</td>
            <td>${car.name}</td>
            <td>${car.version == 0 ? "Eco" : "Plus"}</td>
            <td>${car.price}</td>
            <td>${formatDate(car.releaseDate)}</td>
            <td class="text-center d-flex gap-2 justify-content-center">
                <button class="btn btn-outline-primary btn-sm me-1 edit-btn" title="Chỉnh sửa">
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
        btn.addEventListener('click', () => loadCarManagement(page));
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