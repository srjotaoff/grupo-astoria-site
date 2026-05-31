const ENTERPRISE = 'Chocosul';

async function fetchJson(url) {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) {
        throw new Error(`Falha ao carregar: ${url}`);
    }

    return response.json();
}

function startLogoMarquee(scroller) {
    const halfWidth = scroller.scrollWidth / 2;
    if (!halfWidth) return;

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

async function hydrateBannerCarousel() {
    const imageElement = document.querySelector('#carrossel-img');
    if (!imageElement) return;

    const sourceElement = document.querySelector('#carrossel source');
    const data = await fetchJson(`/api/banners?empresa=${encodeURIComponent(ENTERPRISE)}`);
    const banners = Array.isArray(data?.banners) ? data.banners : [];
    if (!banners.length) return;

    let index = 0;
    const showBanner = () => {
        const banner = banners[index];
        const imageUrl = `/api/banners/${banner.id}/imagem`;

        imageElement.src = imageUrl;
        imageElement.alt = banner.nome ? `Banner ${banner.nome}` : 'Banner Chocosul';

        if (sourceElement) {
            sourceElement.srcset = imageUrl;
            sourceElement.type = '';
        }

        index = (index + 1) % banners.length;
    };

    showBanner();

    if (banners.length > 1) {
        setInterval(showBanner, 6000);
    }
}

async function hydratePartnerLogos() {
    const scroller = document.querySelector('#main_primeiro_inferior_imagens');
    if (!scroller) return;

    const data = await fetchJson(`/api/parceiros?empresa=${encodeURIComponent(ENTERPRISE)}`);
    const parceiros = Array.isArray(data?.parceiros) ? data.parceiros : [];
    if (!parceiros.length) return;

    scroller.innerHTML = '';

    parceiros.forEach((parceiro) => {
        const image = document.createElement('img');
        image.src = `/api/parceiros/${parceiro.id}/imagem`;
        image.alt = parceiro.nome ? `Logo ${parceiro.nome}` : 'Logo parceira';
        image.loading = 'lazy';
        image.decoding = 'async';
        scroller.appendChild(image);
    });

    const originals = Array.from(scroller.children);
    originals.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        scroller.appendChild(clone);
    });

    startLogoMarquee(scroller);
}

window.addEventListener('load', async () => {
    try {
        await hydrateBannerCarousel();
    } catch (error) {
        console.error('Nao foi possivel carregar banners dinamicos.', error);
    }

    try {
        await hydratePartnerLogos();
    } catch (error) {
        console.error('Nao foi possivel carregar logos dinamicas.', error);
    }
});