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
    const caixas = document.querySelectorAll('.main_terceiro_elementos_caixas, .main_segundo_inferior_caixa');

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


