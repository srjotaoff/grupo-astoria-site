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



function normalizeText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
}

function wireCaixasObserver() {
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
}

async function fetchEmpresas() {
    const response = await fetch('/api/parceiros?detalhes=1', {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Falha ao carregar empresas.');
    }

    const data = await response.json();
    return Array.isArray(data?.parceiros) ? data.parceiros : [];
}

function renderEmpresas(container, empresas) {
    if (!container || !empresas.length) return;

    container.innerHTML = '';

    empresas.forEach((empresa) => {
        const caixa = document.createElement('div');
        caixa.className = 'main_segundo_caixas';

        const conteudo = document.createElement('div');
        conteudo.className = 'conteudo_animado';

        const image = document.createElement('img');
        image.src = `/api/parceiros/${empresa.id}/imagem`;
        image.alt = normalizeText(empresa?.nome) || 'Empresa do Grupo Astoria';

        const textos = document.createElement('div');
        textos.className = 'main_segundo_caixas_textos';

        const titulo = document.createElement('p');
        titulo.className = 'main_segundo_caixas_textos_titulo';
        titulo.textContent = normalizeText(empresa?.nome);

        const informacao = document.createElement('p');
        informacao.className = 'main_segundo_caixas_textos_informacao';
        informacao.textContent = normalizeText(empresa?.descricao);

        textos.appendChild(titulo);
        textos.appendChild(informacao);
        conteudo.appendChild(image);
        conteudo.appendChild(textos);
        caixa.appendChild(conteudo);
        container.appendChild(caixa);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#main_segundo');

    try {
        const empresas = await fetchEmpresas();
        renderEmpresas(container, empresas);
    } catch (error) {
        console.error('Nao foi possivel carregar as empresas do grupo.', error);
    } finally {
        wireCaixasObserver();
    }
});

