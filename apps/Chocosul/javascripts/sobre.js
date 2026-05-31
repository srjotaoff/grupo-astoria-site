window.addEventListener('load', () => { // Usamos 'load' para garantir que as imagens carregaram e têm tamanho
    const scroller = document.querySelector('#main_segundo_inferio_imgs');
    if (!scroller) return;

    // 1. Clonar as logos (Set A + Set B)
    const items = Array.from(scroller.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', true);
        scroller.appendChild(clone);
    });

    // 2. O SEGREDO: Calcular a largura real de METADE do scroller
    // Usamos scrollWidth / 2 para saber exatamente onde a primeira metade termina
    const halfWidth = scroller.scrollWidth / 2;

    // 3. Criar a animação usando o valor em pixels
    const animation = scroller.animate([
        { transform: 'translateX(0)' },
        { transform: `translateX(-${halfWidth}px)` } // Move exatamente a largura das logos originais
    ], {
        duration: 40000, // 30 segundos para um deslize suave
        iterations: Infinity,
        easing: 'linear'
    });

    // Pausar ao passar o mouse (opcional, mas profissional)
    scroller.addEventListener('mouseenter', () => animation.pause());
    scroller.addEventListener('mouseleave', () => animation.play());
});