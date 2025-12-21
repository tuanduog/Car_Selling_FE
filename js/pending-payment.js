const Base_Url = "http://localhost:7000"; // URL backend

export async function getPayment(page = 0, keyword, type) {
    const token = localStorage.getItem('jwt');
    const paymentStatus = 0;
    const response = await fetch(`${Base_Url}/api/payment/v1?page=${page}&keyword=${encodeURIComponent(keyword)}&paymentStatus=${Number(paymentStatus)}&paymentType=${encodeURIComponent(type)}`, {
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
export async function loadPendingPaymentManagement(page = 0){
    currentPage = page;
    const searchInput = document.getElementById('pendingSearch');
    const tableBody = document.querySelector("#pending-payment-table tbody");
    const selectType = document.getElementById('paymentType');
    const paginationContainer = document.getElementById('pagination');

    if(!searchInput || !tableBody || !selectType || !paginationContainer) {
        console.log('pending-payment-management HTML chưa load xong');
        return;
    }

    if (!searchInput.dataset.listenerAttached) { 
        searchInput.addEventListener('input', () => loadPendingPaymentManagement(0));
        searchInput.dataset.listenerAttached = true; 
    }
    
    if (!selectType.dataset.listenerAttached) { 
        selectType.addEventListener('change', () => loadPendingPaymentManagement(0));
        selectType.dataset.listenerAttached = true; 
    } 

    const keyword = searchInput.value || "";
    const typeStr = document.getElementById('paymentType').value || "";
    let type = "";
    if(typeStr === "installment"){
        type = 0;
    } else if(typeStr === "full"){
        type = 1;
    }

    try {
        const payments = await getPayment(page, keyword, type);
        renderTable(payments.data.content);

        attachTableEvents();

        renderPagination(payments.data.totalPages, Number(currentPage));
    } catch(error){
        console.error("Lỗi khi fetch payment:", error);
    }
}

// cancel
const handleCancel = async (id) => {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${Base_Url}/api/payment/cancelled/v1/${id}`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    const result = await response.json();
    if(result.statusCode === 200){
        showToast("Hủy đơn hàng thành công", "success");
        window.location.reload();
    } else {
        showToast("Hủy đơn hàng thất bại", "error");
    }
}

// accept
const handleAccept = async (id) => {
    const token = localStorage.getItem("jwt");
    const response = await fetch(`${Base_Url}/api/payment/accepted/v1/${id}`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    const result = await response.json();
    if(result.statusCode === 200){
        showToast("Duyệt đơn hàng thành công", "success");
        window.location.reload();
    } else {
        showToast("Duyệt đơn hàng thất bại", "error");
    }
}

function viewDetail(id) {
    const token = localStorage.getItem("jwt");
    const modal = new bootstrap.Modal(
        document.getElementById("paymentDetailModal")
    );

    modal.show();

    fetch(`${Base_Url}/api/payment/v1/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(result => {
        if (result.statusCode === 200) {
            const p = result.data;

            const formatMoney = (v) =>
                Number(v).toLocaleString("vi-VN") + " VNĐ";

            const paymentTypeText =
                p.paymentType === 0 ? "Trả góp" : "Thanh toán toàn bộ";

            const statusHtml =
                p.paymentStatus === 0 ? `<span class="badge bg-danger">Chờ xét duyệt</span>` :
                    p.paymentStatus === 1
                    ? `<span class="badge bg-warning">Đang thanh toán</span>`
                    : p.paymentStatus === 2
                    ? `<span class="badge bg-success">Đã thanh toán</span>`
                    : `<span class="badge bg-secondary text-dark">Đã hủy</span>`;

            const installmentHtml =
                p.paymentType === 0
                    ? `
                    <hr>
                    <h6 class="fw-semibold text-primary">Thông tin trả góp</h6>
                    <div class="row g-2">
                        <div class="col-6"><b>Thời gian vay:</b></div>
                        <div class="col-6">${p.loanDuration} tháng</div>

                        <div class="col-6"><b>Số tiền trả trước:</b></div>
                        <div class="col-6">${formatMoney(p.downPayment)}</div>

                        <div class="col-6"><b>Ngân hàng:</b></div>
                        <div class="col-6">${p.bankName}</div>

                        <div class="col-6"><b>Lãi suất:</b></div>
                        <div class="col-6">${p.interestRate * 100}% / năm</div>
                    </div>
                    `
                    : "";

            document.getElementById("paymentDetailBody").innerHTML = `
                <h6 class="fw-semibold text-primary">Thông tin khách hàng</h6>
                <div class="row g-2 mb-2">
                    <div class="col-4"><b>Họ và tên:</b></div>
                    <div class="col-8">${p.customerName}</div>

                    <div class="col-4"><b>Email:</b></div>
                    <div class="col-8">${p.customerEmail}</div>

                    <div class="col-4"><b>SĐT:</b></div>
                    <div class="col-8">${p.phone}</div>

                    <div class="col-4"><b>CCCD:</b></div>
                    <div class="col-8">${p.identityNumber}</div>
                </div>

                <hr>

                <h6 class="fw-semibold text-primary">Thông tin đơn hàng</h6>
                <div class="row g-2">
                    <div class="col-4"><b>Mã đơn:</b></div>
                    <div class="col-8">${p.code}</div>

                    <div class="col-4"><b>Sản phẩm:</b></div>
                    <div class="col-8">${p.carName}</div>

                    <div class="col-4"><b>Màu sắc:</b></div>
                    <div class="col-8">${p.carColor}</div>

                    <div class="col-4"><b>Phiên bản:</b></div>
                    <div class="col-8">${p.carVersion === 0 ? "Eco" : "Plus"}</div>

                    <div class="col-4"><b>Giá:</b></div>
                    <div class="col-8 text-danger fw-semibold">${formatMoney(p.price)}</div>

                    <div class="col-4"><b>Hình thức:</b></div>
                    <div class="col-8">${paymentTypeText}</div>

                    <div class="col-4"><b>Trạng thái:</b></div>
                    <div class="col-8">${statusHtml}</div>
                </div>

                ${installmentHtml}
            `;
        }
    })
    .catch(() => {
        document.getElementById("paymentDetailBody").innerHTML =
            `<p class="text-danger">Lỗi hệ thống</p>`;
    });
}

function attachTableEvents() {
    const tbody = document.querySelector("#pending-payment-table tbody");

    tbody.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr) return;
        const id = tr.dataset.id;

        if (e.target.closest(".detail-btn")) {
            viewDetail(id);
        }

        if(e.target.closest(".accept-btn")) {
            handleAccept(id);
        }

        if (e.target.closest(".cancel-btn")) {
            handleCancel(id);
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

function renderTable(payments){
    const tbody = document.querySelector("#pending-payment-table tbody");
    tbody.innerHTML = payments.map(payment => `
        <tr data-id="${payment.id}">
            <td>${payment.code}</td>
            <td>${payment.customerName}</td>
            <td>${payment.carName}</td>
            <td>${payment.price}</td>
            <td>${payment.paymentType == 1 ? "Thanh toán toàn bộ" : "Thanh toán trả góp"}</td>
            <td>${formatDate(payment.paymentDate)}</td>
            <td>
                <span class="badge bg-danger">
                    Chờ xét duyệt
                </span>
            </td>
            <td class="text-center d-flex gap-2 justify-content-center">
                <button class="btn btn-outline-primary btn-sm me-1 detail-btn" title="Chi tiết">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-success btn-sm me-1 accept-btn" title="Duyệt">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm cancel-btn" title="Hủy">
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