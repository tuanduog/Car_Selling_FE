async function loadPage(url) {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById('mainContent').innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
    loadPage('pages/dashboard.html');
})

const fullName = localStorage.getItem('fullName');
document.getElementById('fullNameSpan').textContent = fullName;
document.getElementById('fullNameH6').textContent = fullName;

const email = localStorage.getItem('email');
document.getElementById('email').textContent = email;