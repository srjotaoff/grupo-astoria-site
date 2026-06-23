var STORAGE_KEY = 'portal_vendedor_usuario';

function getUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_e) {
        return null;
    }
}

function buildLookerUrl(baseUrl, filtro, cpf) {
    return baseUrl +
        '?params=%7B%22' + encodeURIComponent(filtro) +
        '%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
        encodeURIComponent(cpf) + '%22%7D';
}

function renderIframe(src) {
    var main = document.querySelector('main');
    var iframe = document.createElement('iframe');
    iframe.setAttribute('width', window.innerWidth);
    iframe.setAttribute('height', window.innerHeight);
    iframe.setAttribute('src', src);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    main.innerHTML = '';
    main.appendChild(iframe);
}

async function init() {
    var usuario = getUsuario();
    if (!usuario || !usuario.cpf_usuario) {
        window.location.href = 'portal_vendedor_acesso.html';
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) {
        window.location.href = 'portal_vendedor_menu.html';
        return;
    }

    try {
        var res = await fetch('/api/portal-vendedor/opcoes/' + encodeURIComponent(id));
        var data = await res.json();
        if (!res.ok || !data.ok || !data.opcao) {
            window.location.href = 'portal_vendedor_menu.html';
            return;
        }

        var opcao = data.opcao;

        if (opcao.filtro) {
            var lookerUrl = buildLookerUrl(opcao.url, opcao.filtro, usuario.cpf_usuario);
            renderIframe(lookerUrl);
        } else {
            window.location.href = opcao.url;
        }
    } catch (_e) {
        window.location.href = 'portal_vendedor_menu.html';
    }
}

document.addEventListener('DOMContentLoaded', init);
