document.addEventListener("DOMContentLoaded", () => {
    const barrinhas = document.getElementById("header_esquerdo_barrinhas");

    // Guardamos onde cada coisa deve ficar no computador (originais)
    const containerRotasOriginal = document.getElementById("header_direito_navegacao_rotas");
    const containerHeaderDireito = document.getElementById("header_direito");
    const containerIconesOriginal = document.getElementById("header_direito_canto_icones");

    // Salvamos a lista real dos botões antes de qualquer movimentação
    const linksOriginais = Array.from(document.querySelectorAll("#header_direito_navegacao_rotas a"));
    const btnLoja = containerHeaderDireito ? containerHeaderDireito.querySelector("a") : null;
    const icones = containerIconesOriginal ? Array.from(containerIconesOriginal.querySelectorAll("a")) : [];

    // O mesmo limite de 1024px que você usou no seu CSS
    const BREAKPOINT = 1024; 

    function monitorarLayout() {
        const ehCelular = window.innerWidth <= BREAKPOINT;
        let menu = document.getElementById("menu_lateral");
        let overlay = document.getElementById("overlay_menu");

        if (ehCelular) {
            // --- MODO CELULAR: CRIA O MENU MÓVEL E MOVE OS BOTÕES ---
            
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.id = "overlay_menu";
                overlay.onclick = fecharMenu;
                document.body.appendChild(overlay);
            }

            if (!menu) {
                menu = document.createElement("div");
                menu.id = "menu_lateral";
                menu.className = "menu-escondido";

                // Move os links para dentro do menu do celular
                linksOriginais.forEach(link => menu.appendChild(link));

                // Move o botão da Loja Online
                if (btnLoja) {
                    btnLoja.id = "menu_lateral_loja"; 
                    menu.appendChild(btnLoja);
                }

                // Move os ícones sociais
                if (icones.length > 0) {
                    const containerIcones = document.createElement("div");
                    containerIcones.id = "menu_lateral_icones_container";
                    icones.forEach(icone => containerIcones.appendChild(icone));
                    menu.appendChild(containerIcones);
                }

                document.body.appendChild(menu);
            }
        } else {
            // --- MODO COMPUTADOR: DESFAZ O MENU MÓVEL E DEVOLVE OS BOTÕES ---
            fecharMenu(); 

            if (menu) {
                // Devolve os botões de rota para o cabeçalho do PC
                if (containerRotasOriginal) {
                    linksOriginais.forEach(link => containerRotasOriginal.appendChild(link));
                }

                // Devolve o botão da loja e remove o ID temporário do mobile
                if (btnLoja && containerHeaderDireito) {
                    btnLoja.removeAttribute("id");
                    if (containerIconesOriginal) {
                        containerHeaderDireito.insertBefore(btnLoja, containerIconesOriginal);
                    } else {
                        containerHeaderDireito.appendChild(btnLoja);
                    }
                }

                // Devolve os ícones sociais para o canto original
                if (containerIconesOriginal && icones.length > 0) {
                    icones.forEach(icone => containerIconesOriginal.appendChild(icone));
                }

                // Deleta a estrutura do celular para limpar o HTML do PC
                menu.remove();
            }

            if (overlay) {
                overlay.remove();
            }
        }
    }

    // FUNÇÕES DE CONTROLE (Buscando dinamicamente para evitar bugs de referência)
    const abrirMenu = () => {
        const menu = document.getElementById("menu_lateral");
        const overlay = document.getElementById("overlay_menu");
        if (!menu || !overlay) return;

        menu.classList.remove("menu-escondido");
        menu.classList.add("menu-visivel");
        overlay.classList.add("ativo");
        document.body.style.overflow = "hidden";
    };

    const fecharMenu = () => {
        const menu = document.getElementById("menu_lateral");
        const overlay = document.getElementById("overlay_menu");
        if (!menu || !overlay) return;

        menu.classList.add("menu-escondido");
        menu.classList.remove("menu-visivel");
        overlay.classList.remove("ativo");
        document.body.style.overflow = "";
    };

    // Cliques das Barrinhas
    if (barrinhas) {
        barrinhas.onclick = (e) => {
            e.stopPropagation();
            if (window.innerWidth > BREAKPOINT) return; // ignora no PC

            const menu = document.getElementById("menu_lateral");
            if (!menu) return;

            const estaVisivel = menu.classList.contains("menu-visivel");
            estaVisivel ? fecharMenu() : abrirMenu();
        };
    }

    // Clique fora fecha o menu
    document.addEventListener("click", (e) => {
        const menu = document.getElementById("menu_lateral");
        if (menu && menu.classList.contains("menu-visivel") && 
            !menu.contains(e.target) && 
            (!barrinhas || !barrinhas.contains(e.target))) {
            fecharMenu();
        }
    });

    // Inicia o monitoramento e escuta alterações de tamanho de janela
    monitorarLayout();
    window.addEventListener("resize", monitorarLayout);
});