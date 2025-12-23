const Base_Url = "http://localhost:7000"; // URL backend

export async function getCar() {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/customer/vehicle/v1`, {
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

export async function renderVehicles(){
    try {
        const vehicles = await getCar();
        const grid = document.getElementById('vehicleGrid');
        grid.innerHTML = "";

        vehicles.data.forEach(v => {
            grid.insertAdjacentHTML("beforeend", `
                <div class="col-md-3">
                    <div class="grid-card">
                        <img src="${v.imageUrl}" alt="${v.name}">
                        <div class="mt-2 fw-semibold" onclick="openCarDetail(${v.id})" style="cursor: pointer;">${v.name}</div>
                        <div class="price">${formatPrice(v.price)}</div>
                        <button class="btn btn-primary btn-buy"
                            onclick="openCarPayment(${v.id})">
                            Mua ngay
                        </button>
                    </div>
                </div>
            `);
        });
    } catch (error){
        console.log(error);
    }
}

window.openCarDetail = function (id){
    localStorage.setItem('carId', id);
    loadPage('pages-customer/car-detail.html');
}

window.openCarPayment = function (id){
    localStorage.setItem('carId', id);
    loadPage('pages-customer/deposit.html');
}

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " đ";
}

