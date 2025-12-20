const Base_Url = "http://localhost:7000"; // URL backend

export async function getBankInterest(){
    try {
        const token = localStorage.getItem('jwt');

        const response = await fetch(`${Base_Url}/api/bank-interest/v1`, {
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

export async function calculateInstallment(loanYear, downPayment, price, bankInterest){
    try {
        const token = localStorage.getItem('jwt');
        const data = { loanYear, downPayment, price, bankInterest};
        console.log(data);

        const response = await fetch(`${Base_Url}/api/bank-interest/calculate/v1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    return response.json();
    } catch (error) {
        console.log(error);
    }
}

let onlyCarPrice = null;
let selectedLoanYear = null;
let selectedDownPayment = null;
let selectedBankInterest = null;

export async function renderDetail(){
    const carImage = localStorage.getItem('carImage');
    document.getElementById('carImage').src = carImage;
    const wheelBase = localStorage.getItem('wheelBase');
    document.getElementById('wheelBase').innerHTML = `${wheelBase} mm`;
    const batteryRange = localStorage.getItem('batteryRange');
    document.getElementById('batteryRange').innerHTML = `${batteryRange} (NEDC)`;
    const maxPower = localStorage.getItem('maxPower');
    document.getElementById('maxPower').innerHTML = `${maxPower} kW`;
    const carPrice = localStorage.getItem('carPrice');
    document.getElementById('carPrice').innerHTML = `${carPrice}`;
    document.getElementById('carPrice1').innerHTML = `${carPrice}`;
    document.getElementById('carPrice2').innerHTML = `${carPrice}`;
    onlyCarPrice = localStorage.getItem('onlyPrice');

    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function () {

            document.querySelectorAll('.color-box')
            .forEach(b => b.classList.remove('active'));

            this.classList.add('active');

            const color = this.style.background;

            sessionStorage.setItem(
            'selectedCarColor',
            JSON.stringify({
                color: color
            })
            );
        });
    });

    // Chọn showroom
    const showroomData = {
        "Hà Nội": [
            "Showroom Mỹ Đình",
            "Showroom Long Biên",
            "Showroom Cầu Giấy"
        ],
        "TP. Hồ Chí Minh": [
            "Showroom Quận 7",
            "Showroom Thủ Đức",
            "Showroom Tân Bình"
        ],
        "Đà Nẵng": [
            "Showroom Hải Châu",
            "Showroom Thanh Khê"
        ],
        "Cần Thơ": [
            "Showroom Ninh Kiều"
        ]
        };

        const provinceSelect = document.getElementById("provinceSelect");
        const showroomSelect = document.getElementById("showroomSelect");

        // Đổ danh sách tỉnh
        Object.keys(showroomData).forEach(province => {
            const option = document.createElement("option");
            option.value = province;
            option.textContent = province;
            provinceSelect.appendChild(option);
        });

        // Khi chọn tỉnh
        provinceSelect.addEventListener("change", function () {
        const province = this.value;

        showroomSelect.innerHTML = '<option value="">-- Chọn Showroom --</option>';
        showroomSelect.disabled = !province;

        if (!province) return;

        showroomData[province].forEach(showroom => {
            const option = document.createElement("option");
            option.value = showroom;
            option.textContent = showroom;
            showroomSelect.appendChild(option);
        });
    });

    // Chọn loại payment
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const fullSection = document.getElementById('paymentFull');
    const installmentSection = document.getElementById('paymentInstallment');

    function updatePaymentDisplay() {
    const selected = document.querySelector('input[name="payment"]:checked');

    if (selected.value === 'full') {
        fullSection.classList.remove('d-none');
        fullSection.classList.add('d-block');

        installmentSection.classList.remove('d-flex', 'd-block');
        installmentSection.classList.add('d-none');
    } else {
        fullSection.classList.remove('d-block');
        fullSection.classList.add('d-none');

        installmentSection.classList.remove('d-none');
        installmentSection.classList.add('d-block'); // hoặc 'd-flex' nếu layout flex
    }
    }

    paymentRadios.forEach(radio => {
    radio.addEventListener('change', updatePaymentDisplay);
    });

    updatePaymentDisplay();

    // Chọn thời hạn và số tiền trả trước

    function setupOptionGroup(groupSelector, callback) {
    const group = document.querySelector(groupSelector);
    const buttons = group.querySelectorAll('.option-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
        // remove active trong group
        buttons.forEach(b => b.classList.remove('active'));

        // set active cho button được chọn
        btn.classList.add('active');

        // lấy value
        callback(btn.dataset.value);
        });
    });
    }

    setupOptionGroup('.loan-group', value => {
        selectedLoanYear = Number(value);
       tryCalculateInstallment();
    });

    setupOptionGroup('.percent-group', value => {
        selectedDownPayment = Number(value) / 100;
        tryCalculateInstallment();
    });


    // Chọn ngân hàng
    const bankSelect = document.getElementById('bankSelect');
    const response = await getBankInterest();

    response.data.forEach(bank => {
        const option = document.createElement("option");
        option.value = Number(bank.interestRate);
        option.textContent = `${bank.bank} - ${(bank.interestRate * 100).toFixed(1)} %/năm`;
        bankSelect.appendChild(option);
    });

    bankSelect.addEventListener('change', () => {
        selectedBankInterest = Number(bankSelect.value);
        tryCalculateInstallment();
    });


}
let installmentDetails = null;

async function tryCalculateInstallment() {
    if (onlyCarPrice === null || selectedLoanYear === null || selectedDownPayment === null || selectedBankInterest === null) {
        return;
    }

    const result = await calculateInstallment(
        selectedLoanYear,
        selectedDownPayment,
        onlyCarPrice,
        selectedBankInterest
    );

    const data = result.data;

    document.getElementById('loanAmount').innerHTML = formatPrice(data.loanAmount);
    document.getElementById('interestAmount').innerHTML = formatPrice(data.totalInterest);
    document.getElementById('totalAmount').innerHTML = formatPrice(data.totalPayment);
    document.getElementById('estimateMonthlyPayment').innerHTML = formatPrice(data.estimateMonthlyPayment);
    installmentDetails = data.installmentDetails;
}

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
}

function renderInstallmentTable(){
    const tbody = document.getElementById("installmentTableBody");

    tbody.innerHTML = installmentDetails.map(detail => {
        return `
            <tr data-id="${detail.month}">
                <td>${detail.month}</td>
                <td>${detail.openingBalance}</td>
                <td>${detail.principalPayment}</td>
                <td>${detail.interestPayment}</td>
                <td>${detail.totalPayment}</td>
                <td>${detail.closingBalance}</td>
            </tr>
        `;
    }
    ).join('');
}