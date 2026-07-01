window.addEventListener('load', () => { 
    const scrollers = document.querySelectorAll('#main_primeiro_slide, #main_footer_slide');

    if (!scrollers.length) return;

    scrollers.forEach(scroller => {
        const items = Array.from(scroller.children);

        // Clonar itens
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', true);
            scroller.appendChild(clone);
        });

        const halfWidth = scroller.scrollWidth / 2;

        // Criar animação
        const animation = scroller.animate([
            { transform: 'translateX(0)' },
            { transform: `translateX(-${halfWidth}px)` } 
        ], {
            duration: 100000,
            iterations: Infinity,
            easing: 'linear'
        });

        // Controle de pausa (opcional)
        scroller.addEventListener('mouseleave', () => animation.play());
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const caixas = document.querySelectorAll('.main_segundo_caixa1,.main_segundo_caixa2');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
            } else {
                entry.target.classList.remove('visivel');
            }
        });
    }, { 
        
        threshold: 0.001 
    });

   
    caixas.forEach(caixa => {
        observer.observe(caixa);
    });
});