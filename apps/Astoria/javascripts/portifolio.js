const DEFAULT_DESCRIPTIONS = {
    'redbull': 'Lider mundial na categoria de bebidas energeticas, a Red Bull e o combustivel oficial da superacao. Do esporte de elite ao cotidiano urbano, estamos presentes onde a energia e o foco sao essenciais. Energia para corpo e mente.',
    'nissin': 'Lider global em macarrao instantaneo, transformamos o tempo em sabor. Criamos alimentos que se adaptam ao seu ritmo de vida, garantindo uma refeicao quente e satisfatoria em minutos. Sabor que move o seu dia.',
    'pilao': 'Referencia maxima em sabor e aroma marcantes, a Pilao e o combustivel que desperta e move o dia a dia dos brasileiros. Unimos tradicao e intensidade para garantir a energia que o seu cotidiano exige.',
    'bis': 'O classico wafer coberto de chocolate que conquistou geracoes. BIS e sinonimo de leveza e prazer em cada mordida, presente nas melhores memorias afetivas dos brasileiros.',
    'hersheys': "A marca americana de chocolate mais reconhecida do mundo. Com produtos que vao de barras classicas a spreads irresistiveis, a Hershey's transforma momentos simples em experiencias memoraveis.",
    'scjohnson': 'Uma empresa familiar lider em produtos domesticos, comprometida com a saude, higiene e bem-estar. Presente em lares do mundo inteiro com marcas de confianca ha mais de 130 anos.',
    'baygon': 'Referencia mundial em protecao contra insetos, o Baygon oferece solucoes eficazes para o combate a mosquitos, baratas e outros vetores de doencas, garantindo mais saude e tranquilidade ao seu lar.'
};

async function fetchParceiros() {
    const response = await fetch('/api/parceiros?detalhes=1', {
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

function normalizePartnerKey(value) {
    return normalizeText(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function normalizePartnerSlug(value) {
    return normalizeText(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function createPartnerCard(parceiro) {
    const nome = normalizeText(parceiro?.nome);
    const descricao = normalizeText(parceiro?.descricao);
    const url = normalizeText(parceiro?.url);
    const marca = nome || 'Parceiro';
    const descricaoFallback = DEFAULT_DESCRIPTIONS[normalizePartnerKey(nome)] || 'Descricao nao informada.';
    const slug = normalizePartnerSlug(nome) || 'parceiro';

    const article = document.createElement('article');
    article.className = 'main_unico_caixa';
    article.setAttribute('aria-label', marca);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'main_unico_caixa_img';

    const image = document.createElement('img');
    image.className = 'main_unico_caixa_img_marcas';
    image.src = `/api/parceiros/${parceiro.id}/imagem`;
    image.alt = nome ? `Logo ${nome}` : 'Logo parceira';
    image.loading = 'lazy';
    image.decoding = 'async';

    imageWrapper.appendChild(image);

    const productsLink = document.createElement('a');
    productsLink.className = 'main_unico_caixa_texto';
    productsLink.href = url || `/produtos/${slug}`;
    productsLink.setAttribute('aria-label', `Ver produtos ${marca}`);
    productsLink.append(`Ver produtos ${marca} `);

    const productsLinkIcon = document.createElement('img');
    productsLinkIcon.src = 'images/icones/icone_seta_direita_preto.svg';
    productsLinkIcon.alt = '';
    productsLinkIcon.setAttribute('aria-hidden', 'true');
    productsLink.appendChild(productsLinkIcon);

    imageWrapper.appendChild(productsLink);

    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'main_unico_caixa_texto_informaçao';

    const title = document.createElement('h2');
    title.className = 'main_unico_caixa_texto_informaçao_titulo';
    title.textContent = marca;

    const description = document.createElement('p');
    description.className = 'main_unico_caixa_texto_informaçao_texto';
    description.textContent = descricao || descricaoFallback;

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
