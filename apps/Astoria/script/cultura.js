
document.addEventListener("DOMContentLoaded", () => {
    const caixas = document.querySelectorAll('.main_segundo_caixa');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                entry.target.classList.add('visivel');
            } else {
                
                entry.target.classList.remove('visivel');
            }
        });
    }, { 
        threshold: 0.01 
    });

    caixas.forEach(caixa => {
        observer.observe(caixa);
    });
});