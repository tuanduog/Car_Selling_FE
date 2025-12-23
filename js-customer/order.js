const Base_Url = "http://localhost:7000"; // URL backend

export async function getOrder(){
    try {
        const token = localStorage.getItem('jwt');

        const response = await fetch(`${Base_Url}/api/order/v1`, {
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
    } catch (error) {
        console.log(error);
    }
}

export async function loadOrder(){
    const container = document.getElementById("order-list");
    if(!container){
        console.log('orders HTML chưa load xong');
        return;
    }
    try {
        const orders = await getOrder();

        renderOrders(orders.data);

        attachCardEvents();

    } catch(error){
        console.error("Lỗi khi fetch order:", error);
    }
}

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
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

            const payBtn = document.getElementById('payBtn');
            payBtn.classList.add('d-none');

            if(p.paymentStatus === 1){
                payBtn.classList.remove("d-none");
                payBtn.onclick = () => {
                    fetch(`${Base_Url}/api/payment/v1/${id}/pay`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then(res => res.json())
                    .then(result => {
                        if (result.checkoutUrl) {
                            window.location.href = result.checkoutUrl;
                        } else {
                            alert("Đang chờ PayOS xác nhận thanh toán");
                        }
                    });
                };

            }

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
                        <div class="col-6">${formatMoney(Math.round(p.downPayment * p.price))}</div>

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

function attachCardEvents() {
    const container = document.getElementById("order-list");
    if (!container) return;

    container.addEventListener("click", (e) => {
        const btn = e.target.closest(".detail-btn");
        if (!btn) return;

        const card = btn.closest(".order-card");
        const id = card.dataset.id;

        if (id) {
            viewDetail(id);
        }
    });
}


function renderOrders(orders){
    const container = document.getElementById("order-list");

    if (!orders || orders.length === 0) {
        container.innerHTML = `<p class="text-muted">Bạn chưa có đơn hàng nào</p>`;
        return;
    }
    container.innerHTML = orders
    .map(o => `
        <div class="card mb-4 border-0 shadow-sm order-card" data-id="${o.id}">
            <div class="card-body px-4 py-4">
                <div class="row align-items-center gy-3">

                    <!-- Product -->
                    <div class="col-md-5">
                        <h6 class="fw-semibold mb-2">
                            ${o.carName}
                        </h6>

                        <div class="d-flex flex-wrap gap-2 mb-2">
                            <span class="badge bg-light text-dark border">
                                Màu: ${o.carColor}
                            </span>
                            <span class="badge bg-light text-dark border">
                                ${o.carVersion == 0 ? "Eco" : "Plus"}
                            </span>
                        </div>

                        ${
                            o.paymentType === 0
                                ? `
                                    <small class="text-muted d-block">
                                        <i class="bi bi-cash-coin me-1"></i>
                                        Trả trước:
                                        <strong>
                                            ${formatPrice(Math.round(o.downPayment * o.price))}
                                        </strong>
                                    </small>
                                  `
                                : `
                                    <small class="text-muted d-block">
                                        <i class="bi bi-box-seam me-1"></i>
                                        1 sản phẩm
                                    </small>
                                  `
                        }
                    </div>

                    <!-- Order info -->
                    <div class="col-md-4 text-muted small">
                        <div class="mb-2">
                            <strong class="text-dark">
                                ${o.code}
                            </strong>
                        </div>

                        <div class="mb-2">
                            <i class="bi bi-calendar-event me-1"></i>
                            ${formatDate(o.orderDate)}
                        </div>

                        <span class="badge rounded-pill ${
                            o.paymentType === 1
                                ? "bg-success-subtle text-success"
                                : "bg-warning-subtle text-warning"
                        } px-3 py-1 mt-1">
                            ${
                                o.paymentType === 1
                                    ? "Thanh toán toàn bộ"
                                    : "Thanh toán trả góp"
                            }
                        </span>
                    </div>

                    <!-- Price -->
                    <div class="col-md-3 text-md-end">
                        <div class="fw-bold fs-5 text-danger mb-2">
                            ${formatPrice(o.price)}
                        </div>

                        <span class="badge rounded-pill ${
                            o.paymentStatus === 2
                                ? "bg-primary"
                                : o.paymentStatus === 1
                                    ? "bg-danger"
                                    : o.paymentStatus === 0
                                        ? "bg-warning"
                                        : "bg-secondary"
                        } mb-2 d-inline-block">
                            ${
                                o.paymentStatus === 2
                                    ? "Đã thanh toán"
                                    : o.paymentStatus === 0
                                        ? "Đang chờ duyệt"
                                        : o.paymentStatus === 1
                                            ? "Chưa thanh toán"
                                            : "Đã hủy"
                            }
                        </span>

                        <div class="mt-2">
                            <button
                                class="btn btn-outline-primary btn-sm px-3 detail-btn"
                            >
                                Chi tiết
                                <i class="bi bi-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `)
    .join("");
}

