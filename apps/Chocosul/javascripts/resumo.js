const STORAGE_KEY = 'portal_vendedor_usuario';

// Recupera o CPF do usuário logado a partir do localStorage.
function getCpf() {
    try {
        const usuario = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (usuario && usuario.cpf_usuario) {
            return String(usuario.cpf_usuario).replace(/\D/g, '');
        }
    } catch (_e) { /* ignora */ }

    return '';
}

// Lê o id da opção (relatório) a partir da query string: resumo.html?id=123
function getOpcaoId() {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Substitui o marcador %%cpf%% (em qualquer link) pelo CPF do usuário logado,
// sem máscara. Se o link não tiver o marcador, é usado como está.
function montarUrl(url, cpf) {
    return url.split('%%cpf%%').join(cpf);
}

function embedIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', window.innerWidth);
    iframe.setAttribute('height', window.innerHeight);
    iframe.setAttribute('src', src);

    const main = document.querySelector('main');
    main.innerHTML = '';
    main.appendChild(iframe);
}

async function carregarRelatorio() {
    const cpf = getCpf();
    if (!cpf) {
        window.location.href = 'portal_vendedor_acesso.html';
        return;
    }

    const id = getOpcaoId();
    if (!id) {
        window.location.href = 'portal_vendedor_menu.html';
        return;
    }

    try {
        const res = await fetch('/api/portal-vendedor/opcoes');
        const data = await res.json();
        const opcoes = (res.ok && data.ok) ? (data.opcoes || []) : [];
        const opcao = opcoes.find(function (o) { return o.id === id; });

        if (!opcao || !opcao.url) {
            window.location.href = 'portal_vendedor_menu.html';
            return;
        }

        embedIframe(montarUrl(opcao.url, cpf));
    } catch (_e) {
        // silencioso
    }
}

document.addEventListener('DOMContentLoaded', carregarRelatorio);
