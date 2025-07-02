// Menú móvil (para versión responsive)
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.querySelector('nav ul');

    menuBtn.addEventListener('click', function() {
        nav.classList.toggle('show');
    });
});