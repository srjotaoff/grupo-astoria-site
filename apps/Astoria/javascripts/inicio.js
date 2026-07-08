const elementos = document.querySelectorAll(".animar-texto");

elementos.forEach((elemento) => {
    const texto = elemento.textContent;
    elemento.textContent = "";

    let i = 0;
    let timeoutId;

    function escrever() {
        if (i < texto.length) {
            elemento.textContent += texto.charAt(i);
            i++;
            timeoutId = setTimeout(escrever, 40);
        }
    }

    function apagar() {
        if (i > 0) {
            elemento.textContent = texto.substring(0, i - 1);
            i--;
            timeoutId = setTimeout(apagar, 20);
        }
    }

    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                clearTimeout(timeoutId);
                escrever();
            } else {
                clearTimeout(timeoutId);
                apagar();
            }
        });
    }

    const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.1
    });

    observer.observe(elemento);
});




document.addEventListener("DOMContentLoaded", () => {
    const caixas = document.querySelectorAll('.main_segundo_inferior_caixa');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                entry.target.classList.add('visivel');
            } else {
                
                entry.target.classList.remove('visivel');
            }
        });
    }, { 
        threshold: 0.1 
    });

    caixas.forEach(caixa => {
        observer.observe(caixa);
    });
});




document.addEventListener("DOMContentLoaded", () => {
    const secoes = document.querySelectorAll('.secao-full');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                setTimeout(() => {
                    entry.target.classList.add('visivel');
                }, 4000); 
            } else {
                entry.target.classList.remove('visivel');
            }
        });
    }, { 
        threshold: 0.1 
    });

    secoes.forEach(secao => {
        observer.observe(secao);
    });
});




function normalizeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
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

function startBannerRotation(container, banners) {
    if (!container || !banners.length) return;

    container.innerHTML = '';

    const createSlide = (banner) => {
        const slide = document.createElement('div');
        slide.className = 'banner-carrossel-slide';

        const image = document.createElement('img');
        image.src = `/api/banners/${banner.id}/imagem`;
        image.alt = normalizeText(banner?.nome) || 'Banner Astoria';
        image.loading = 'eager';
        image.decoding = 'async';

        slide.appendChild(image);
        return slide;
    };

    const track = document.createElement('div');
    track.className = 'banner-carrossel-track';

    banners.forEach((banner) => {
        track.appendChild(createSlide(banner));
    });

    if (banners.length > 1) {
        track.appendChild(createSlide(banners[0]));
    }

    container.appendChild(track);

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
    const bannerContainer = document.querySelector('#main_primeiro_informacao_imagem');

    try {
        const banners = await fetchBanners();
        startBannerRotation(bannerContainer, banners);
    } catch (error) {
        console.error('Nao foi possivel carregar os banners dinamicos da home.', error);
    }
});

window.addEventListener('load', () => {
    const scrollers = document.querySelectorAll('#main_segundo_slide');

    if (!scrollers.length) return;

    scrollers.forEach(scroller => {
        const items = Array.from(scroller.children);

        
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', true);
            scroller.appendChild(clone);
        });

        const halfWidth = scroller.scrollWidth / 2;

        
        const animation = scroller.animate([
            { transform: 'translateX(0)' },
            { transform: `translateX(-${halfWidth}px)` } 
        ], {
            duration: 80000,
            iterations: Infinity,
            easing: 'linear'
        });

        
        scroller.addEventListener('mouseleave', () => animation.play());
    
    });
});


