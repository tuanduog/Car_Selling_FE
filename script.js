async function loadPage(url) {

    localStorage.setItem('currentPage', url);

    const res = await fetch(url);
    const html = await res.text();
    document.getElementById('mainContent').innerHTML = html;

    if (url.includes("account-management")) {
        const module = await import('./js/account.js');
        requestAnimationFrame(() => {
            module.loadAccountManagement();
        });
    }

    if(url.includes("team-leader-management")){
        const module = await import('./js/staff.js');
        setTimeout(() => {
            module.loadLeaderManagement();
        }, 0);
    }

    if(url.includes("add")){
        const module = await import('./js/add-staff.js');
        requestAnimationFrame(() => {
            module.initAddLeader();
        });
    }
    fillUserInfo();

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
        loadPage('pages/dashboard.html');
        setActiveMenu('pages/dashboard.html');
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
