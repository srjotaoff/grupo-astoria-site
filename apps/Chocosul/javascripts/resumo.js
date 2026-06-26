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

// Troca o CPF placeholder salvo no link pelo CPF do usuário logado.
// O CPF são os últimos 11 dígitos do bloco numérico (na URL do Looker ele vem
// "colado" no delimitador codificado, ex.: ...%2580 + 09671254560), por isso
// usamos (?!\d) para pegar exatamente os 11 dígitos finais do bloco.
function montarUrl(url, cpf) {
    return url.replace(/\d{11}(?!\d)/, cpf);
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
    console.log('[resumo] raw localStorage:', localStorage.getItem(STORAGE_KEY));

    const cpf = getCpf();
    console.log('[resumo] cpf logado:', JSON.stringify(cpf), 'tamanho:', cpf.length);
    if (!cpf) {
        console.warn('[resumo] sem CPF -> redirecionando para acesso');
        window.location.href = 'portal_vendedor_acesso.html';
        return;
    }

    const id = getOpcaoId();
    console.log('[resumo] query string:', window.location.search, '-> id:', id);
    if (!id) {
        console.warn('[resumo] sem id valido -> redirecionando para menu');
        window.location.href = 'portal_vendedor_menu.html';
        return;
    }

    try {
        const res = await fetch('/api/portal-vendedor/opcoes');
        const data = await res.json();
        console.log('[resumo] resposta /opcoes:', res.status, data);
        const opcoes = (res.ok && data.ok) ? (data.opcoes || []) : [];
        const opcao = opcoes.find(function (o) { return o.id === id; });
        console.log('[resumo] opcao encontrada:', opcao);

        if (!opcao || !opcao.url) {
            console.warn('[resumo] opcao/url ausente -> redirecionando para menu');
            window.location.href = 'portal_vendedor_menu.html';
            return;
        }

        const match = opcao.url.match(/\d{11}(?!\d)/);
        console.log('[resumo] url do banco:', opcao.url);
        console.log('[resumo] trecho que sera substituido (CPF placeholder):', match ? match[0] : '(NENHUM 11-digitos encontrado)');

        const urlFinal = montarUrl(opcao.url, cpf);
        console.log('[resumo] url final (com CPF logado):', urlFinal);
        console.log('[resumo] substituicao ocorreu?', urlFinal !== opcao.url);

        embedIframe(urlFinal);
    } catch (e) {
        console.error('[resumo] erro ao carregar relatorio:', e);
    }
}

document.addEventListener('DOMContentLoaded', carregarRelatorio);
