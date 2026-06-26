const STORAGE_KEY = 'portal_vendedor_usuario';

function getUsuario() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_e) {
        return null;
    }
}

function criarBotao(texto, href) {
    const a = document.createElement('a');
    a.href = href;

    const botao = document.createElement('button');

    const p = document.createElement('p');
    p.textContent = texto;

    const img = document.createElement('img');
    img.src = 'images/icones/icone_seta_direita_preto.svg';
    img.alt = '';

    botao.appendChild(p);
    botao.appendChild(img);
    a.appendChild(botao);
    return a;
}

function renderOpcoes(opcoes) {
    const container = document.getElementById('main_unico_caixa');
    if (!container) return;
    container.innerHTML = '';

    opcoes.forEach(function (opcao) {
        // Roteia para a página genérica de relatório; a substituição do CPF
        // placeholder pelo CPF do usuário logado acontece no resumo.js.
        container.appendChild(criarBotao(opcao.nome, 'resumo.html?id=' + encodeURIComponent(opcao.id)));
    });

    container.appendChild(criarBotao('SOLICITAR SUPORTE', 'solicitar_suporte.html'));
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
        renderOpcoes(opcoes);
    } catch (_e) {
        // silencioso
    }
}

document.addEventListener('DOMContentLoaded', carregarOpcoes);
