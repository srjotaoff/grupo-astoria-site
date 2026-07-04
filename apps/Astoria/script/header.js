document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.querySelector("header");

    if (!headerContainer) {
        console.error("Elemento <header> não encontrado na página.");
        return;
    }

    fetch("header.html")
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error("Não foi possível carregar header.html (status " + resposta.status + ")");
            }
            return resposta.text();
        })
        .then(html => {
            headerContainer.innerHTML = html;
            initMenuLateral();
        })
        .catch(erro => {
            console.error("Erro ao inserir o header:", erro);
        });
});

function initMenuLateral() {
    const barrinhas = document.getElementById("header_esquerdo_barrinhas");
    const overlay = document.getElementById("overlay_menu");

    let menu = document.getElementById("menu_lateral");

    if (!menu) {
        // Fallback: só constrói do zero se o header.html não tiver trazido o menu pronto
        menu = document.createElement("div");
        menu.id = "menu_lateral";
        menu.className = "menu-escondido";

        const linksOriginais = document.querySelectorAll("#header_direito_navegacao_rotas a");
        let conteudoHTML = "";

        linksOriginais.forEach(link => {
            conteudoHTML += `<a href="${link.getAttribute("href")}"><button>${link.innerText}</button></a>`;
        });

        const btnLoja = document.querySelector("#header_direito > a");
        if (btnLoja) {
            conteudoHTML += `<a id="menu_lateral_loja" href="${btnLoja.getAttribute("href")}"><button>Loja Online</button></a>`;
        }

        const iconesOriginais = document.querySelector("#header_direito_canto_icones");
        if (iconesOriginais) {
            conteudoHTML += `<div id="menu_lateral_icones_container">${iconesOriginais.innerHTML}</div>`;
        }

        menu.innerHTML = conteudoHTML;
        document.body.appendChild(menu);
    }

    const abrirMenu = () => {
        menu.classList.remove("menu-escondido");
        menu.classList.add("menu-visivel");
        if (overlay) overlay.classList.add("ativo");
        document.body.style.overflow = "hidden";
    };

    const fecharMenu = () => {
        menu.classList.add("menu-escondido");
        menu.classList.remove("menu-visivel");
        if (overlay) overlay.classList.remove("ativo");
        document.body.style.overflow = "";
    };

    // Clique nas barrinhas abre/fecha o menu
    if (barrinhas) {
        barrinhas.onclick = (e) => {
            e.stopPropagation();
            const estaVisivel = menu.classList.contains("menu-visivel");
            estaVisivel ? fecharMenu() : abrirMenu();
        };
    }

    // Clique no overlay fecha o menu
    if (overlay) {
        overlay.onclick = fecharMenu;
    }

    // Clique fora do menu fecha o menu
    document.addEventListener("click", (e) => {
        if (menu.classList.contains("menu-visivel") &&
            !menu.contains(e.target) &&
            (!barrinhas || !barrinhas.contains(e.target))) {
            fecharMenu();
        }
    });
}