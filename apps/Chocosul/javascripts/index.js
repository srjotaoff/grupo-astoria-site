const ENTERPRISE = 'Chocosul';

function normalizeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
}

async function fetchParceiros() {
    const response = await fetch(`/api/parceiros?empresa=${encodeURIComponent(ENTERPRISE)}`, {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Falha ao carregar parceiros.');
    }

    const data = await response.json();
    return Array.isArray(data?.parceiros) ? data.parceiros : [];
}

async function fetchBanners() {
    const response = await fetch(`/api/banners?empresa=${encodeURIComponent(ENTERPRISE)}`, {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Falha ao carregar banners.');
    }

    const data = await response.json();
    return Array.isArray(data?.banners) ? data.banners : [];
}

function renderLogos(scroller, parceiros) {
    if (!scroller || !parceiros.length) return;

    scroller.innerHTML = '';
    const baseFragment = document.createDocumentFragment();

    parceiros.forEach((parceiro) => {
        const image = document.createElement('img');
        image.src = `/api/parceiros/${parceiro.id}/imagem`;
        image.alt = normalizeText(parceiro?.nome) || 'Parceiro';
        image.loading = 'lazy';
        image.decoding = 'async';
        baseFragment.appendChild(image);
    });

    scroller.appendChild(baseFragment);

    Array.from(scroller.children).forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        scroller.appendChild(clone);
    });

    const halfWidth = scroller.scrollWidth / 2;
    const animation = scroller.animate([
        { transform: 'translateX(0)' },
        { transform: `translateX(-${halfWidth}px)` }
    ], {
        duration: 40000,
        iterations: Infinity,
        easing: 'linear'
    });

    scroller.addEventListener('mouseenter', () => animation.pause());
    scroller.addEventListener('mouseleave', () => animation.play());
}

function startBannerRotation(carouselImage, banners) {
    if (!carouselImage || !banners.length) return;

    let index = 0;

    const applyBanner = () => {
        const current = banners[index];
        carouselImage.src = `/api/banners/${current.id}/imagem`;
        carouselImage.alt = normalizeText(current?.nome) || 'Banner Chocosul';
    };

    applyBanner();

    if (banners.length > 1) {
        window.setInterval(() => {
            index = (index + 1) % banners.length;
            applyBanner();
        }, 5000);
    }
}

window.addEventListener('load', async () => {
    const scroller = document.querySelector('#main_primeiro_inferior_imagens');
    const carouselImage = document.querySelector('#carrossel-img');

    try {
        const [parceiros, banners] = await Promise.all([fetchParceiros(), fetchBanners()]);
        renderLogos(scroller, parceiros);
        startBannerRotation(carouselImage, banners);
    } catch (error) {
        console.error('Nao foi possivel carregar as imagens dinamicas da home.', error);
    }
});