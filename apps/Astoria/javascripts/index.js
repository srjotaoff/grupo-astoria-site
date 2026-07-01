function normalizeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
}

async function fetchParceiros() {
    const response = await fetch('/api/parceiros', {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Falha ao carregar parceiros.');
    }

    const data = await response.json();
    return Array.isArray(data?.parceiros) ? data.parceiros : [];
}

async function fetchBanners() {
    const response = await fetch('/api/banners', {
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

function startBannerRotation(carousel, banners) {
    if (!carousel || !banners.length) return;

    carousel.innerHTML = '';

    const createSlide = (banner) => {
        const slide = document.createElement('div');
        slide.className = 'carrossel-slide';

        const image = document.createElement('img');
        image.src = `/api/banners/${banner.id}/imagem`;
        image.alt = normalizeText(banner?.nome) || 'Banner Chocosul';
        image.loading = 'eager';
        image.decoding = 'async';

        slide.appendChild(image);
        return slide;
    };

    const track = document.createElement('div');
    track.className = 'carrossel-track';

    banners.forEach((banner) => {
        track.appendChild(createSlide(banner));
    });

    if (banners.length > 1) {
        track.appendChild(createSlide(banners[0]));
    }

    carousel.appendChild(track);

    if (banners.length < 2) return;

    const transitionDuration = 900;
    const intervalDuration = 7000;
    let index = 0;

    const setSlidePosition = (animate = true) => {
        track.style.transition = animate ? `transform ${transitionDuration}ms ease-in-out` : 'none';
        track.style.transform = `translateX(-${index * 100}%)`;
    };

    setSlidePosition(false);

    window.setInterval(() => {
        index += 1;
        setSlidePosition(true);

        if (index === banners.length) {
            window.setTimeout(() => {
                index = 0;
                setSlidePosition(false);
            }, transitionDuration);
        }
    }, intervalDuration);
}

window.addEventListener('load', async () => {
    const scroller = document.querySelector('#main_primeiro_inferior_imagens');
    const carousel = document.querySelector('#carrossel');

    try {
        const [parceiros, banners] = await Promise.all([fetchParceiros(), fetchBanners()]);
        renderLogos(scroller, parceiros);
        startBannerRotation(carousel, banners);
    } catch (error) {
        console.error('Nao foi possivel carregar as imagens dinamicas da home.', error);
    }
});