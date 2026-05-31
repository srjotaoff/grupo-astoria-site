async function injectHeader() {
    const header = document.querySelector("header");
    if (!header) {
        console.error("Nenhum <header> encontrado na pagina.");
        return;
    }

    try {
        const res = await fetch("/header");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        header.innerHTML = await res.text();
        initMenuLateral();
        await window.initComponentes?.();
    } catch (err) {
        console.error("Falha ao injetar o header:", err);
    }
}

function initMenuLateral() {
    const barrinhas = document.getElementById("header_esquerdo_barrinhas");
    const menu = document.getElementById("menu_lateral");
    const overlay = document.getElementById("overlay_menu");

    if (!barrinhas || !menu || !overlay) return;

    function abrirMenu() {
        menu.classList.replace("menu-escondido", "menu-visivel");
        overlay.classList.add("ativo");
        barrinhas.setAttribute("aria-expanded", "true");
        menu.setAttribute("aria-hidden", "false");
    }

    function fecharMenu() {
        menu.classList.replace("menu-visivel", "menu-escondido");
        overlay.classList.remove("ativo");
        barrinhas.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
    }

    barrinhas.addEventListener("click", abrirMenu);
    overlay.addEventListener("click", fecharMenu);

    const menuLinks = menu.querySelectorAll("a");
    menuLinks.forEach((link) => {
        link.addEventListener("click", fecharMenu);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("menu-visivel")) {
            fecharMenu();
        }
    });
}

document.addEventListener("DOMContentLoaded", injectHeader);
