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

botaoAcesso.addEventListener('click', async (e) => {
    e.preventDefault();

    const cpf = campoCPF.value.replace(/\D/g, '');
    const endpoint = cpf
        ? `/api/portal-vendedor/usuarios?cpf=${encodeURIComponent(cpf)}`
        : '/api/portal-vendedor/usuarios';

    const response = await fetch(endpoint);
    const data = await response.json();

    console.log('Dados Oracle retornados:', data);
});