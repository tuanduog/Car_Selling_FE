async function loadPage(url) {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById('mainContent').innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
    loadPage('pages/dashboard.html');
})