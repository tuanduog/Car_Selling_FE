window.loadPage = async function(url) {

    localStorage.setItem('currentPage', url);

    const res = await fetch(url);
    const html = await res.text();
    document.getElementById('mainContent').innerHTML = html;

    if(url.includes("product")){
        const module = await import('./js-customer/car-customer.js');
        setTimeout(() => {
            module.renderVehicles();
        }, 0);
    }

    if(url.includes("car-detail")){
        const module = await import('./js-customer/car-detail.js');
        setTimeout(() => {
            module.renderCarDetail();
        }, 0);
    }
   
    fillUserInfo();

    initStepConfig();

    if(url.includes("profile")) {
        const module = await import('./js/profile.js');
        module.initProfilePage();
    }

}

function logout() {
    const logoutBtn = document.getElementById('btnLogout');
    
    if(!logoutBtn) return;

    logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('jwt');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('currentPage');

    window.location.href = 'pages-login.html';
    });
}

function fillUserInfo() {
    const fullName = localStorage.getItem('fullName') || ''; // fallback if null
    const email = localStorage.getItem('email') || '';       // fallback if null

    const fullNameIds = ['fullNameSpan', 'fullNameH6', 'fullNameH2', 'fullNameDiv'];
    fullNameIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = fullName;
    });

    const emailIds = ['email', 'emailProfile', 'emailDiv'];
    emailIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = email;
    });

    const fullNameEdit = document.getElementById('fullNameEdit');
    if (fullNameEdit) fullNameEdit.value = fullName;

    const emailEdit = document.getElementById('emailEdit');
    if (emailEdit) emailEdit.value = email;
}


window.addEventListener('DOMContentLoaded', () => {
    logout();

    const msg = localStorage.getItem("toastMessage");
    const type = localStorage.getItem("toastType");

    if(msg && type){
        showToast(msg, type);
        localStorage.removeItem("toastMessage");
        localStorage.removeItem("toastType");
    }

    let savedPage = localStorage.getItem('currentPage');
    let redirectPage = localStorage.getItem('redirectPage');

    if(redirectPage){
        localStorage.removeItem('redirectPage');
        loadPage(redirectPage);
        setActiveMenu(redirectPage);
        return;
    }
    if(savedPage) {
        loadPage(savedPage);
        setActiveMenu(savedPage)
    } else {
        loadPage('pages-customer/home.html');
        setActiveMenu('pages-customer/home.html');
    }

})

document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
  link.addEventListener('click', function (event) {
    event.stopPropagation();

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => {
      l.classList.remove('active');
      l.classList.add('collapsed');
    });

    this.classList.add('active');
    this.classList.remove('collapsed');
  });
});


function setActiveMenu(page) {
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => {
        l.classList.remove('active');
        l.classList.add('collapsed');

        // tìm menu có onclick chứa đúng file HTML
        if (l.getAttribute("onclick")?.includes(page)) {
            l.classList.add('active');
            l.classList.remove('collapsed');
        }
    });
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
        ?.addEventListener('click', () => nextStep(3));

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

function showToast(message, type = "success"){
    const toast = document.getElementById("toast");
    toast.textContent = message;
    
    toast.className = "toast";
    if(type === "success"){
        toast.classList.add("show");
    } else {
        toast.classList.add("show", "error");
    }

    setTimeout(() => {
        toast.className = "toast";
    }, 2500);
}
