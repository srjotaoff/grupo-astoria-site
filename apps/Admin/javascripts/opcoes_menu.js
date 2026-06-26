// ── Auth ──────────────────────────────────────────────────────────────────────
async function checkAuth() {
  var res = await fetch(BASE_PATH + '/admin/session-check', { credentials: 'include' })
  if (res.status === 401 || res.status === 403) window.location.replace(BASE_PATH + '/')
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function setStatus(el, msg, isError) {
  if (!el) return
  el.textContent = msg
  el.className = 'card-status' + (isError ? ' error' : '')
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderOpcoes(opcoes) {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.querySelectorAll('.main_tudo_caixas_caixa').forEach(function (el) { el.remove() })
  opcoes.forEach(function (opcao) {
    container.insertBefore(createOpcaoCard(opcao), addBtn)
  })
}

function createOpcaoCard(opcao) {
  var card = document.createElement('div')
  card.className = 'main_tudo_caixas_caixa'
  if (opcao && opcao.id) card.dataset.id = opcao.id

  var ativoChecked = (opcao && opcao.ativo !== false) ? ' checked' : ''

  card.innerHTML =
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Título da opção</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="nome" value="' + escHtml(opcao && opcao.nome) + '" placeholder="Título da opção" maxlength="200">' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Url</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="url" value="' + escHtml(opcao && opcao.url) + '" placeholder="Ex: https://exemplo.com">' +
    '</div>' +
    '<label class="ativo-toggle">' +
      '<input type="checkbox" data-field="ativo"' + ativoChecked + '>' +
      '<span>Ativo</span>' +
    '</label>' +
    '<div class="card-actions">' +
      '<button class="btn-salvar">' + (opcao && opcao.id ? 'Salvar' : 'Criar opção') + '</button>' +
      '<img class="main_tudo_caixas_caixa_lixeira" src="images/icones/lixeira.svg" alt="Excluir">' +
    '</div>' +
    '<p class="card-status"></p>'

  var saveBtn = card.querySelector('.btn-salvar')
  var delBtn  = card.querySelector('.main_tudo_caixas_caixa_lixeira')
  if (saveBtn) saveBtn.addEventListener('click', function () { saveCard(card) })
  if (delBtn)  delBtn.addEventListener('click',  function () { deleteCard(card) })

  return card
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveCard(card) {
  var id       = card.dataset.id ? Number(card.dataset.id) : null
  var isNew    = !id
  var statusEl = card.querySelector('.card-status')
  var saveBtn  = card.querySelector('.btn-salvar')

  var nomeEl  = card.querySelector('[data-field="nome"]')
  var urlEl   = card.querySelector('[data-field="url"]')
  var ativoEl = card.querySelector('[data-field="ativo"]')

  var body = {
    nome:  nomeEl  ? nomeEl.value.trim() : '',
    url:   urlEl   ? urlEl.value.trim()  : '',
    ativo: ativoEl ? (ativoEl.checked ? 1 : 0) : 1,
  }

  saveBtn.disabled = true
  setStatus(statusEl, 'Salvando...', false)

  try {
    var url    = isNew ? BASE_PATH + '/admin/opcoes' : BASE_PATH + '/admin/opcoes/' + id
    var method = isNew ? 'POST' : 'PATCH'
    var res    = await fetch(url, {
      method: method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 401 || res.status === 403) { window.location.replace(BASE_PATH + '/'); return }
    var data = await res.json().catch(function () { return {} })
    if (!res.ok) { setStatus(statusEl, (data && data.message) || 'Erro ao salvar.', true); return }
    setStatus(statusEl, isNew ? 'Opção criada!' : 'Salvo com sucesso!', false)
    if (isNew) loadOpcoes()
  } catch (_e) {
    setStatus(statusEl, 'Sem conexão com o servidor.', true)
  } finally {
    saveBtn.disabled = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteCard(card) {
  var id = card.dataset.id ? Number(card.dataset.id) : null
  if (!id) { card.remove(); return }
  if (!window.confirm('Deseja excluir esta opção?')) return

  var statusEl = card.querySelector('.card-status')
  setStatus(statusEl, 'Excluindo...', false)

  try {
    var res = await fetch(BASE_PATH + '/admin/opcoes/' + id, { method: 'DELETE', credentials: 'include' })
    if (res.status === 401 || res.status === 403) { window.location.replace(BASE_PATH + '/'); return }
    if (!res.ok) {
      var data = await res.json().catch(function () { return {} })
      setStatus(statusEl, (data && data.message) || 'Erro ao excluir.', true)
      return
    }
    card.remove()
  } catch (_e) {
    setStatus(statusEl, 'Sem conexão com o servidor.', true)
  }
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadOpcoes() {
  try {
    var res  = await fetch(BASE_PATH + '/admin/opcoes', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) { window.location.replace(BASE_PATH + '/'); return }
    var data = await res.json()
    renderOpcoes(data.opcoes || [])
  } catch (_e) { /* silent */ }
}

// ── Add button ────────────────────────────────────────────────────────────────
document.getElementById('main_tudo_caixas_adcionar').addEventListener('click', function () {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.insertBefore(createOpcaoCard(null), addBtn)
})

// ── Init ──────────────────────────────────────────────────────────────────────
checkAuth()
loadOpcoes()

