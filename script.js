async function loadPage(url) {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById('mainContent').innerHTML = html;

    fillUserInfo();
    if(url.includes("profile")){
        initProfilePage();
    }
}

function fillUserInfo() {
    const fullName = localStorage.getItem('fullName');
    document.getElementById('fullNameSpan').textContent = fullName;
    document.getElementById('fullNameH6').textContent = fullName;
    document.getElementById('fullNameH2').textContent = fullName;
    document.getElementById('fullNameDiv').textContent = fullName;

    const email = localStorage.getItem('email');
    document.getElementById('email').textContent = email;
    document.getElementById('emailProfile').textContent = email;
    document.getElementById('emailDiv').textContent = email;

    document.getElementById('fullNameEdit').value = fullName;
    document.getElementById('emailEdit').value = email;
}

window.addEventListener('DOMContentLoaded', () => {
    loadPage('pages/dashboard.html');
})
