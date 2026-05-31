function initMenuLateral() {
    const barrinhas = document.getElementById("header_esquerdo_barrinhas");
    
    let menu = document.getElementById("menu_lateral");
    
    if (!menu) {
        menu = document.createElement("div");
        menu.id = "menu_lateral";
        menu.className = "menu-escondido";
        
        const linksOriginais = document.querySelectorAll("#header_direito_navegacao_rotas a");
        let conteudoHTML = "";
        
        linksOriginais.forEach(link => {
            conteudoHTML += `<a href="${link.href}"><button>${link.innerText}</button></a>`;
        });

        const btnLoja = document.querySelector("#header_direito > a");
        if (btnLoja) {
            conteudoHTML += `<a id="menu_lateral_loja" href="${btnLoja.href}"><button>Loja Online</button></a>`;
        }

        const iconesOriginais = document.querySelector("#header_direito_canto_icones");
        if (iconesOriginais) {
            conteudoHTML += `<div id="menu_lateral_icones">${iconesOriginais.innerHTML}</div>`;
        }

        menu.innerHTML = conteudoHTML;
        document.body.appendChild(menu);
    }

    if (barrinhas) {
        barrinhas.onclick = (e) => {
            e.stopPropagation();
            menu.classList.toggle("menu-escondido");
            menu.classList.toggle("menu-visivel");
        };
    }

    document.addEventListener("click", (e) => {
        if (menu && !menu.contains(e.target) && !barrinhas.contains(e.target)) {
            menu.classList.add("menu-escondido");
            menu.classList.remove("menu-visivel");
        }
    });
}