const ENTERPRISE = 'Chocosul';

async function fetchParceiros() {
    const response = await fetch(`/api/parceiros?empresa=${encodeURIComponent(ENTERPRISE)}&detalhes=1`, {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Falha ao carregar parceiros.');
    }

    const data = await response.json();
    return Array.isArray(data?.parceiros) ? data.parceiros : [];
}

function normalizeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
}

function createPartnerCard(parceiro) {
    const nome = normalizeText(parceiro?.nome);
    const descricao = normalizeText(parceiro?.descricao);

    const article = document.createElement('article');
    article.className = 'main_unico_caixa';
    article.setAttribute('aria-label', nome || 'Parceiro');

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'main_unico_caixa_img';

    const image = document.createElement('img');
    image.className = 'main_unico_caixa_img_marcas';
    image.src = `/api/parceiros/${parceiro.id}/imagem`;
    image.alt = nome ? `Logo ${nome}` : 'Logo parceira';
    image.loading = 'lazy';
    image.decoding = 'async';

    imageWrapper.appendChild(image);

    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'main_unico_caixa_texto_informaçao';

    const title = document.createElement('h2');
    title.className = 'main_unico_caixa_texto_informaçao_titulo';
    title.textContent = nome || 'Parceiro';

    const description = document.createElement('p');
    description.className = 'main_unico_caixa_texto_informaçao_texto';
    description.textContent = descricao || 'Descricao nao informada.';

    infoWrapper.appendChild(title);
    infoWrapper.appendChild(description);

    article.appendChild(imageWrapper);
    article.appendChild(infoWrapper);

    return article;
}

window.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#main_unico');
    if (!container) return;

    try {
        const parceiros = await fetchParceiros();
        if (!parceiros.length) return;

        container.innerHTML = '';
        parceiros.forEach((parceiro) => {
            container.appendChild(createPartnerCard(parceiro));
        });
    } catch (error) {
        console.error('Nao foi possivel carregar o portifolio dinamico.', error);
    }
});

