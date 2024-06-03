document.addEventListener("DOMContentLoaded", function () {
    const body = document.getElementById('body');
    const modoClaroButton = document.getElementById('modo-claro');

    modoClaroButton.addEventListener('click', () => {
        body.classList.toggle('modo-claro');
    });
});
