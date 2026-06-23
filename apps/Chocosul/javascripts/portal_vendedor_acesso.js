const campoCPF = document.getElementById('caixa_cpf');
const botaoAcesso = document.getElementById('main_unico_caixa_botao');

campoCPF.addEventListener('input', (e) => {
    let valor = e.target.value;

    // 1. Remove qualquer coisa que não seja número
    valor = valor.replace(/\D/g, "");

    // 2. Aplica a máscara conforme a quantidade de números
    // Formato: 000.000.000-00
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");       // Coloca o primeiro ponto
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");       // Coloca o segundo ponto
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca o traço

    // 3. Atualiza o valor do campo com a máscara
    e.target.value = valor;
});

const STORAGE_KEY = 'portal_vendedor_usuario';

function mostrarMensagem(texto) {
    const alvo = document.getElementById('main_unico_texto');
    if (alvo) alvo.textContent = texto;
}

botaoAcesso.addEventListener('click', async (e) => {
    e.preventDefault();

    const cpf = campoCPF.value.replace(/\D/g, '');
    if (cpf.length !== 11) {
        mostrarMensagem('Informe um CPF válido.');
        return;
    }

    botaoAcesso.disabled = true;
    mostrarMensagem('Verificando...');

    try {
        const response = await fetch(`/api/portal-vendedor/usuarios?cpf=${encodeURIComponent(cpf)}`);
        const data = await response.json();

        const usuario = response.ok && data.ok ? (data.usuarios || [])[0] : null;
        if (!usuario) {
            mostrarMensagem('CPF não encontrado. Verifique e tente novamente.');
            return;
        }

        // Salva na sessão apenas dados não sensíveis (sem CPF e sem telefone)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            tipo_usuario: usuario.tipo_usuario,
            nome_usuario: usuario.nome_usuario,
            cpf_usuario: usuario.cpf_usuario,
        }));

        window.location.href = 'portal_vendedor_menu.html';
    } catch (erro) {
        console.error('Erro ao acessar o portal:', erro);
        mostrarMensagem('Erro ao acessar. Tente novamente em instantes.');
    } finally {
        botaoAcesso.disabled = false;
    }
});