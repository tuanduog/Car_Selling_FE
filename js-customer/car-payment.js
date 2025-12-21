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

let fullName = null;
let phoneNumber = null;
let email = null;
let identityNumber = null;
let showRoom = '';

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
    onlyCarPrice = Number(localStorage.getItem('onlyPrice'));

    initStepConfig();

    // chọn màu
    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function () {

            document.querySelectorAll('.color-box')
            .forEach(b => b.classList.remove('active'));

            this.classList.add('active');

            const selectedColor = this.dataset.color;

            sessionStorage.setItem('selectedColor', selectedColor);
        });
    });

    sessionStorage.setItem('selectedVersion', 0);

    // chọn phiên bản
    document.querySelectorAll('input[name="version"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const version = radio.value;
            sessionStorage.setItem('selectedVersion', version);
        });
    });

    // check personal info
    fullName = document.getElementById('fullName');
    phoneNumber = document.getElementById('phoneNumber');
    email = document.getElementById('email1');
    identityNumber = document.getElementById('identityNumber');

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

        // fetch danh sách tỉnh
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

    showroomSelect.addEventListener("change", function () {
        showRoom = this.value;
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

    const btn = document.getElementById('viewInstallment');
    if (btn) {
        btn.classList.remove('disabled');
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        renderInstallmentTable();
    }
}

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
}

function formatPriceNotVND(price) {
    return Number(price).toLocaleString("vi-VN");
}


export function initInstallmentModal() {
    const btn = document.getElementById('viewInstallment');
    console.log('Installment btn:', btn);
    if (!btn) return;

    const modal = document.getElementById('installmentModal');

    if (modal && !modal.dataset.loaded) {
        modal.addEventListener('shown.bs.modal', () => {
            if (!installmentDetails || installmentDetails.length === 0) {
                alert('Vui lòng chọn đủ thông tin trả góp');
                return;
            }

            renderInstallmentTable();
        });

        modal.dataset.loaded = 'true';
    }
}

function renderInstallmentTable(){
    const tbody = document.getElementById("installmentTableBody");

    tbody.innerHTML = installmentDetails.map(detail => {
        return `
            <tr data-id="${detail.month}">
                <td>${detail.month}</td>
                <td>${formatPriceNotVND(detail.openingBalance)}</td>
                <td>${formatPriceNotVND(detail.principalPayment)}</td>
                <td>${formatPriceNotVND(detail.interestPayment)}</td>
                <td>${formatPriceNotVND(detail.totalPayment)}</td>
                <td>${formatPriceNotVND(detail.closingBalance)}</td>
            </tr>
        `;
    }
    ).join('');
}

function initStepConfig() {

    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const stepItems = document.querySelectorAll('.step-item');

    if (!step1 || !step2 || !step3) {
        console.warn("Step DOM chưa sẵn sàng");
        return;
    }

    let currentStep = 1;

    function renderStep(step) {
        stepItems.forEach(item => {
            const circle = item.querySelector('.step-circle');
            const label = item.querySelector('span.ms-2');

            item.classList.add('text-muted');
            circle.className = 'step-circle bg-light text-dark';
            label.classList.remove('text-primary', 'fw-semibold');
        });

        const active = document.querySelector(`.step-item[data-step="${step}"]`);
        active.classList.remove('text-muted');
        active.querySelector('.step-circle').className = 'step-circle bg-primary text-white';
        active.querySelector('span.ms-2').classList.add('text-primary', 'fw-semibold');

        step1.classList.add('d-none');
        step2.classList.add('d-none');
        step3.classList.add('d-none');

        document.getElementById(`step-${step}`).classList.remove('d-none');
    }

    function setActiveStep(step) {
        if (step > currentStep) return;
        currentStep = step;
        renderStep(step);
    }

    function nextStep(step) {
        if (step > 3) return;
        currentStep = step;
        renderStep(step);
    }

    // ===== Button next =====
    document.getElementById('to-step-2')
        ?.addEventListener('click', () => nextStep(2));

    document.getElementById('to-step-3')
        ?.addEventListener('click', () => {
            const fullNameValue = fullName?.value?.trim() || '';
            const phoneValue = phoneNumber?.value?.trim() || '';
            const emailValue = email?.value?.trim() || '';
            const identityValue = identityNumber?.value?.trim() || '';
            const showRoomValue = showRoom || '';
            if (!fullNameValue || !phoneValue || !emailValue || !identityValue || !showRoomValue) {
            showToast("Vui lòng điền đầy đủ thông tin (*)", "warning");
            return;
        }

        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(phoneValue)) {
            showToast("Số điện thoại không hợp lệ", "warning");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            showToast("Email không hợp lệ", "warning");
            return;
        }

        const identityRegex = /^[0-9]{9}|[0-9]{12}$/;
        if (!identityRegex.test(identityValue)) {
            showToast("Căn cước/CMND không hợp lệ", "warning");
            return;
        }

        // ----- Lưu session -----
        sessionStorage.setItem('fullName', fullNameValue);
        sessionStorage.setItem('phoneNumber', phoneValue);
        sessionStorage.setItem('email', emailValue);
        sessionStorage.setItem('identityNumber', identityValue);
        sessionStorage.setItem('showRoom', showRoomValue);
            
            nextStep(3);
        });

    // ===== Click step header (chỉ cho lùi) =====
    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const step = Number(item.dataset.step);
            setActiveStep(step);
        });
    });

    // init
    renderStep(1);
}