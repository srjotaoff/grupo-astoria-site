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

window.addEventListener('load', async () => {
    const scroller = document.querySelector('#main_segundo_inferio_imgs');
    if (!scroller) return;

    try {
        const parceiros = await fetchParceiros();
        renderLogos(scroller, parceiros);
    } catch (error) {
        console.error('Nao foi possivel carregar as imagens dinamicas de Sobre nos.', error);
    }
});