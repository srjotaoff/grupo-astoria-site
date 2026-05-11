document.addEventListener("DOMContentLoaded", () => {
    const barrinhas = document.getElementById("header_esquerdo_barrinhas");
    const menu = document.getElementById("menu_lateral");

    if (barrinhas && menu) {
        barrinhas.addEventListener("click", () => {
            menu.classList.toggle("menu-escondido");
            menu.classList.toggle("menu-visivel");
        });
    }
});