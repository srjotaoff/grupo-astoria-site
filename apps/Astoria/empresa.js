document.addEventListener('DOMContentLoaded', () => {
    const seta = document.querySelector('#main_primeiro_seta_baixo');
    const destino = document.querySelector('#main_segundo');

    if (!seta || !destino) {
        console.log('Elemento não encontrado');
        return;
    }

    seta.addEventListener('click', () => {
        const posicao = destino.offsetTop ;

        window.scrollTo({
            top: (posicao) + 40,
            behavior: 'smooth'
        });
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const caixas = document.querySelectorAll('.main_segundo_caixas');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
            } else {
                entry.target.classList.remove('visivel');
            }
        });
    }, { 
        // 0.1 significa que assim que 10% da caixa entra na tela, ela aparece.
        // 0.6 (o que você usou) exige que mais da metade da caixa apareça, o que pode falhar em telas pequenas.
        threshold: 0.01 
    });

    // ESTA PARTE É ESSENCIAL: Diz ao observador para olhar cada caixa encontrada
    caixas.forEach(caixa => {
        observer.observe(caixa);
    });
});

