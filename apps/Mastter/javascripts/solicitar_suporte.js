// ================== DADOS DO USUÁRIO (localStorage) ==================
var STORAGE_KEY = 'portal_vendedor_usuario';
var nome_usuario = '';
var cpf_usuario = '';
var linha_usuario = '';

(function carregarUsuario() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    var u = JSON.parse(raw);
    nome_usuario = u.nome_usuario || '';
    cpf_usuario = u.cpf_usuario || '';
    linha_usuario = u.linha_usuario || '';
  } catch (_e) {}
})();

// ================== DADOS CARREGADOS DO BANCO ==================
var solicitacoesCarregadas = [];

// ================== HELPERS ==================
function slugify(str) {
  return String(str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resetTextoOpcoes() {
  document.querySelectorAll("input[name='main_painel_formulario_opcoes_lista']").forEach(function (i) {
    var texto = i.parentElement && i.parentElement.querySelector('.main_painel_formulario_opcoes_lista_opcao_texto');
    if (texto) texto.textContent = i.dataset.descricao || '';
  });
}

function desmarcarTodasOpcoes() {
  document.querySelectorAll("input[name='main_painel_formulario_opcoes_lista']").forEach(function (i) {
    i.checked = false;
  });
  resetTextoOpcoes();
}

// ================== UI: SETORES + LISTAS ==================
function criarBotoesSetor(solicitacoes) {
  var container = document.getElementById('main_painel_formulario_setor');
  if (!container) return;
  container.innerHTML = '';

  var setores = [];
  solicitacoes.forEach(function (s) {
    if (s.setor && setores.indexOf(s.setor) === -1) setores.push(s.setor);
  });
  setores.sort();

  setores.forEach(function (setor) {
    var slug = slugify(setor);
    var btn = document.createElement('button');
    btn.className = 'main_painel_formulario_setor';
    btn.id = 'main_painel_formulario_setor_' + slug;
    btn.textContent = setor;
    btn.addEventListener('click', function () {
      desmarcarTodasOpcoes();
      mostrar_opcoes_lista(slug);
      document.getElementById('main_painel_formulario_opcoes_texto').placeholder = '';
    });
    container.appendChild(btn);
  });
}

function criarListasOpcoesPorSetor(solicitacoes) {
  var containerPai = document.getElementById('main_painel_formulario_opcoes_lista');
  if (!containerPai) return;
  containerPai.innerHTML = '';

  var grupos = {};
  solicitacoes.forEach(function (s) {
    if (!grupos[s.setor]) grupos[s.setor] = [];
    grupos[s.setor].push(s);
  });

  Object.keys(grupos).forEach(function (setor) {
    var lista = grupos[setor];
    var slug = slugify(setor);
    var div = document.createElement('div');
    div.className = 'main_painel_formulario_opcoes_lista';
    div.id = 'main_painel_formulario_opcoes_lista_' + slug;
    div.style.display = 'none';

    lista.forEach(function (item) {
      var label = document.createElement('label');
      label.className = 'main_painel_formulario_opcoes_lista_opcao';

      var slaHoras = (item.sla && item.sla > 0) ? item.sla : 2;

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'main_painel_formulario_opcoes_lista';
      input.value = String(item.id);
      input.checked = false;
      input.dataset.descricao = item.descricao;
      input.dataset.sla = slaHoras;

      var texto = document.createElement('span');
      texto.className = 'main_painel_formulario_opcoes_lista_opcao_texto';
      texto.textContent = item.descricao;

      input.addEventListener('change', function () {
        resetTextoOpcoes();
        if (input.checked) {
          texto.textContent = item.descricao + ' - ' + slaHoras + 'h';
        }
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(' '));
      label.appendChild(texto);

      div.appendChild(label);
    });

    containerPai.appendChild(div);
  });
}

function mostrar_opcoes_lista(setor) {
  document.querySelectorAll('.main_painel_formulario_opcoes_lista').forEach(function (el) {
    el.style.display = 'none';
  });
  var alvo = document.getElementById('main_painel_formulario_opcoes_lista_' + setor);
  if (alvo) {
    alvo.style.display = 'grid';
    alvo.style.gap = '1svh';
    alvo.style.flexDirection = 'column';
  }
}

// ================== SALVAR SOLICITAÇÃO ==================
// A criação da tarefa no Bitrix acontece inteiramente no servidor: o navegador
// só envia os dados do formulário para o backend, nunca fala com o Bitrix direto.
async function salvar_solicitacao() {
  var opcaoSelecionada = document.querySelector('input[name="main_painel_formulario_opcoes_lista"]:checked');
  var botaoSalvar = document.getElementById('main_painel_formulario_botoes_salvar');
  var alerta = document.getElementById('main_painel_formulario_alerta');

  function mostrarAlerta(msg) {
    alerta.style.display = 'flex';
    alerta.style.backgroundColor = 'red';
    alerta.style.color = 'var(--var_cor_branco)';
    alerta.querySelector('p').textContent = msg;
  }

  if (!opcaoSelecionada) {
    mostrarAlerta('Por favor, selecione uma opção válida.');
    return;
  }

  var descricaoUsuario = document.getElementById('main_painel_formulario_opcoes_texto').value;
  if (!descricaoUsuario) {
    mostrarAlerta('Informe detalhes sobre a solicitação.');
    return;
  }

  var solicitacaoId = Number(opcaoSelecionada.value);
  var registro = solicitacoesCarregadas.find(function (s) { return s.id === solicitacaoId; });
  if (!registro) {
    mostrarAlerta('Não foi possível localizar os dados da opção selecionada.');
    return;
  }

  botaoSalvar.disabled = true;

  try {
    var formData = new FormData();
    formData.append('solicitacaoId', String(solicitacaoId));
    formData.append('descricaoUsuario', descricaoUsuario);
    formData.append('nomeUsuario', nome_usuario);
    formData.append('cpfUsuario', cpf_usuario);
    formData.append('telefoneUsuario', linha_usuario);

    var inputFile = document.getElementById('main_painel_formulario_botoes_anexo_input');
    if (inputFile && inputFile.files && inputFile.files.length > 0) {
      formData.append('arquivo', inputFile.files[0]);
    }

    var resp = await fetch('/api/portal-vendedor/solicitacoes/enviar', {
      method: 'POST',
      body: formData
    });
    var data = await resp.json().catch(function () { return {}; });

    if (resp.ok && data.ok) {
      window.location.href = 'solicitacao_sucesso.html';
    } else {
      mostrarAlerta((data && data.message) || 'Erro ao criar a tarefa.');
      botaoSalvar.disabled = false;
    }
  } catch (error) {
    mostrarAlerta('Erro na requisição.');
    console.error(error);
    botaoSalvar.disabled = false;
  }
}

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', function () {
  // File input: mostra nome do arquivo selecionado
  var inputFile = document.getElementById('main_painel_formulario_botoes_anexo_input');
  var labelFile = document.getElementById('main_painel_formulario_botoes_anexo_label');
  if (inputFile && labelFile) {
    inputFile.addEventListener('change', function () {
      labelFile.textContent = (this.files && this.files.length > 0) ? this.files[0].name : 'Anexar arquivo';
    });
  }

  // Botão salvar
  var botaoSalvar = document.getElementById('main_painel_formulario_botoes_salvar');
  if (botaoSalvar) {
    botaoSalvar.addEventListener('click', salvar_solicitacao);
  }

  // Carrega solicitações do banco
  fetch('/api/portal-vendedor/solicitacoes')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      solicitacoesCarregadas = (data.ok ? data.solicitacoes : []) || [];
      criarBotoesSetor(solicitacoesCarregadas);
      criarListasOpcoesPorSetor(solicitacoesCarregadas);
      desmarcarTodasOpcoes();
    })
    .catch(function (err) {
      console.error('Erro ao carregar solicitações:', err);
    });
});
