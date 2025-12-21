const Base_Url = "http://localhost:7000"; // URL backend

export async function getPayment(page = 0, keyword, paymentStatus) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/payment/v1?page=${page}&keyword=${encodeURIComponent(keyword)}&paymentStatus=${encodeURIComponent(paymentStatus)}`, {
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
export async function loadPaymentManagement(page = 0){
    currentPage = page;
    const searchInput = document.getElementById('searchPayment');
    const tableBody = document.querySelector("#payment-table tbody");
    const statusSelect = document.getElementById('paymentStatus');
    const paginationContainer = document.getElementById('pagination');

    if(!searchInput || !tableBody || !statusSelect || !paginationContainer) {
        console.log('payment-management HTML chưa load xong');
        return;
    }

    if (!searchInput.dataset.listenerAttached) { 
        searchInput.addEventListener('input', () => loadPaymentManagement(0));
        searchInput.dataset.listenerAttached = true; 
    }

    if (!statusSelect.dataset.listenerAttached) { 
        statusSelect.addEventListener('change', () => loadPaymentManagement(0));
        statusSelect.dataset.listenerAttached = true; 
    } 

    const keyword = searchInput.value || "";
    const statusStr = document.getElementById('paymentStatus').value || "";
    let status = "";
    if(statusStr === "progress"){
        status = 1;
    } else if(statusStr === "success"){
        status = 2;
    } else if(statusStr === "cancel"){
        status = 3
    }

    try {
        const payments = await getPayment(page, keyword, status);
        renderTable(payments.data.content);
        console.log(payments.data.content);
        // attachTableEvents();

        renderPagination(payments.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch payment:", error);
    }
}

// delete
// const handleDelete = async (id) => {
//     const token = localStorage.getItem("jwt");
//     const response = await fetch(`${Base_Url}/api/vehicle/delete/v1/${id}`, {
//         method: 'PUT',
//         headers: {
//             'Content-type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         }
//     });
//     const result = await response.json();
//     if(result.statusCode === 200){
//         showToast("Xóa thành công", "success");
//         window.location.reload();
//     } else {
//         showToast("Xóa thất bại", "error");
//     }
// }

// function goToEdit(id){
//     localStorage.setItem('carId', id);
//     window.loadPage(`/section/car/edit-car.html`);
// }

// function attachTableEvents() {
//     const tbody = document.querySelector("#payment-table tbody");

//     tbody.addEventListener("click", (e) => {
//         const tr = e.target.closest("tr");
//         if (!tr) return;
//         const id = tr.dataset.id;

//         if (e.target.closest(".detail-btn")) {
//             handleDelete(id);
//         }

//         if (e.target.closest(".cancel-btn")) {
//             goToEdit(id);
//         }
//     });
// }

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

function renderTable(payments){
    const tbody = document.querySelector("#payment-table tbody");

    const filteredPayments = payments.filter(
        payment => payment.paymentStatus !== 0
    );

    tbody.innerHTML = filteredPayments.map(payment => `
        <tr data-id="${payment.id}">
            <td>${payment.code}</td>
            <td>${payment.customerName}</td>
            <td>${payment.carName}</td>
            <td>${payment.price}</td>
            <td>${payment.paymentType == 1 ? "Thanh toán toàn bộ" : "Thanh toán trả góp"}</td>
            <td>${formatDate(payment.paymentDate)}</td>
            <td>
                <span class="badge ${payment.paymentStatus == 1 ? "bg-warning" : payment.paymentStatus ? "bg-success" : "bg-secondary text-dark"}">
                    ${payment.paymentStatus == 1 ? "Đang thanh toán" : payment.paymentStatus == 2 ? "Đã thanh toán" : "Đã hủy"}
                </span>
            </td>
            <td class="text-center d-flex gap-2 justify-content-center">
                <button class="btn btn-outline-primary btn-sm me-1 detail-btn" title="Chi tiết">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm cancle-btn" title="Hủy">
                    <i class="bi bi-x-circle"></i>
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