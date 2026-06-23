// ================== DADOS DO USUÁRIO (sessionStorage) ==================
var STORAGE_KEY = 'portal_vendedor_usuario';
var nome_usuario = '';
var cpf_usuario = '';

(function carregarUsuario() {
  try {
    var raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    var u = JSON.parse(raw);
    nome_usuario = u.nome_usuario || '';
    cpf_usuario = u.cpf_usuario || '';
  } catch (_e) {}
})();

// ================== CONFIG BITRIX ==================
var WEBHOOK_BASE = 'https://chocosul.bitrix24.com.br/rest/270/mwze5xa0wbsh91l1/';

// ================== DADOS CARREGADOS DO BANCO ==================
var solicitacoesCarregadas = [];

// ================== FILE INPUT (mostra nome do anexo) ==================
document.addEventListener('DOMContentLoaded', function () {
  var inputFile = document.getElementById('main_painel_formulario_botoes_anexo_input');
  var labelFile = document.getElementById('main_painel_formulario_botoes_anexo_label');

  if (inputFile && labelFile) {
    inputFile.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        labelFile.textContent = this.files[0].name;
      } else {
        labelFile.textContent = 'Anexar arquivo';
      }
    });
  }
});

// ================== MENU NAV ==================
function menu_navegacao() {
  var botao_menu = document.getElementById('header_painel_navegacao_fundo_esquerda_menu');
  var navegacao_paginas = document.getElementById('header_painel_navegacao_paginas');

  var aberto = navegacao_paginas.classList.toggle('aberto');
  botao_menu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
}

document.addEventListener('click', function (e) {
  var botao_menu = document.getElementById('header_painel_navegacao_fundo_esquerda_menu');
  var navegacao_paginas = document.getElementById('header_painel_navegacao_paginas');

  if (!navegacao_paginas.classList.contains('aberto')) return;

  if (!navegacao_paginas.contains(e.target) && !botao_menu.contains(e.target)) {
    navegacao_paginas.classList.remove('aberto');
    botao_menu.setAttribute('aria-expanded', 'false');
  }
});

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

function desmarcarTodasOpcoes() {
  document.querySelectorAll("input[name='main_painel_formulario_opcoes_lista']").forEach(function (i) {
    i.checked = false;
  });
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

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'main_painel_formulario_opcoes_lista';
      input.value = String(item.id);
      input.checked = false;

      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + item.descricao));

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

// ================== CARREGA SOLICITAÇÕES DO BANCO ==================
document.addEventListener('DOMContentLoaded', function () {
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

// ================== BITRIX: HELPERS ==================
function getTaskIdFromResult(data) {
  return (
    (data && data.result && data.result.task && (data.result.task.id || data.result.task.ID)) ||
    (data && data.result && data.result.taskId) ||
    (data && data.result) ||
    null
  );
}

function taskLinkForUser(userId, taskId) {
  return 'https://chocosul.bitrix24.com.br/company/personal/user/' + userId + '/tasks/task/view/' + taskId + '/';
}

async function bitrixNotifyUser(userId, titulo, taskId) {
  try {
    var body = {
      USER_ID: userId,
      MESSAGE: 'Nova tarefa: ' + titulo + '\n' + taskLinkForUser(userId, taskId)
    };
    var resp = await fetch(WEBHOOK_BASE + 'im.notify.personal.add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var j = await resp.json();
    if (j.error) console.warn('Falha ao notificar', userId, j);
  } catch (e) {
    console.warn('Erro na notificação IM para', userId, e);
  }
}

function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ================== SALVAR SOLICITAÇÃO ==================
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
    var id_responsavel = (registro.id_responsavel && registro.id_responsavel > 0) ? registro.id_responsavel : 270;
    var tempoHoras = (registro.sla && registro.sla > 0) ? registro.sla : 2;
    var prazo_tarefa = new Date(Date.now() + tempoHoras * 60 * 60 * 1000).toISOString();

    var descricaoBitrix =
      'Nome do solicitante: ' + nome_usuario + '\n' +
      'CPF: ' + cpf_usuario + '\n\n' +
      'Detalhes do solicitante:\n' + descricaoUsuario;

    var parametros_api = {
      fields: {
        TITLE: registro.descricao,
        DESCRIPTION: descricaoBitrix,
        RESPONSIBLE_ID: id_responsavel,
        DEADLINE: prazo_tarefa
      }
    };

    // Anexo
    var inputFile = document.getElementById('main_painel_formulario_botoes_anexo_input');
    if (inputFile && inputFile.files && inputFile.files.length > 0) {
      var file = inputFile.files[0];
      var base64 = await fileToBase64(file);
      parametros_api.fields.UF_TASK_WEBDAV_FILES = [];
      parametros_api.fields.SE_PARAMETER = [{ FILE_NAME: file.name, CONTENT: base64 }];
    }

    var resp = await fetch(WEBHOOK_BASE + 'tasks.task.add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parametros_api)
    });
    var data = await resp.json();

    if (data.result) {
      var taskId = getTaskIdFromResult(data);
      await bitrixNotifyUser(id_responsavel, registro.descricao, taskId);
      window.location.href = 'solicitacao_sucesso.html';
    } else {
      mostrarAlerta('Erro ao criar a tarefa.');
      console.error('Bitrix erro:', data);
      botaoSalvar.disabled = false;
    }
  } catch (error) {
    mostrarAlerta('Erro na requisição.');
    console.error(error);
    botaoSalvar.disabled = false;
  }
}
