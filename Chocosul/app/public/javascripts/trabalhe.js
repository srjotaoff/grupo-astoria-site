const campoCPF = document.getElementById('caixa_cpf');

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