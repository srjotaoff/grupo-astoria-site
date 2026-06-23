const STORAGE_KEY = 'portal_vendedor_usuario';

function getUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_e) {
        return null;
    }
}

// A URL salva no banco ja vem com um CPF padrao (11 digitos) ocupado.
// Substitui esse CPF padrao pelo CPF do usuario logado.
function montarLink(url, cpf) {
    if (!url) return '';
    return url.replace(/\d{11}/, cpf);
}

function renderOpcoes(opcoes, cpf) {
    const container = document.getElementById('main_unico_caixa');
    if (!container) return;
    container.innerHTML = '';

    opcoes.forEach(function (opcao) {
        const link = montarLink(opcao.url, cpf);

        const a = document.createElement('a');
        a.href = link || '#';

        const botao = document.createElement('button');

        const p = document.createElement('p');
        p.textContent = opcao.nome;

        const img = document.createElement('img');
        img.src = 'images/icones/icone_seta_direita_preto.svg';
        img.alt = '';

        botao.appendChild(p);
        botao.appendChild(img);
        a.appendChild(botao);
        container.appendChild(a);
    });
}

async function carregarOpcoes() {
    const usuario = getUsuario();
    if (!usuario || !usuario.cpf_usuario) {
        window.location.href = 'portal_vendedor_acesso.html';
        return;
    }

    try {
        const res = await fetch('/api/portal-vendedor/opcoes');
        const data = await res.json();
        const opcoes = (res.ok && data.ok) ? (data.opcoes || []) : [];
        renderOpcoes(opcoes, usuario.cpf_usuario);
    } catch (_e) {
        // silencioso
    }
}

document.addEventListener('DOMContentLoaded', carregarOpcoes);
