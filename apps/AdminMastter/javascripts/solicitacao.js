// ── Auth ──────────────────────────────────────────────────────────────────────
async function checkAuth() {
  var res = await fetch('/admin/session-check', { credentials: 'include' })
  if (res.status === 401 || res.status === 403) window.location.replace('/')
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
function renderSolicitacoes(solicitacoes) {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.querySelectorAll('.main_tudo_caixas_caixa').forEach(function (el) { el.remove() })
  solicitacoes.forEach(function (s) {
    container.insertBefore(createSolicitacaoCard(s), addBtn)
  })
}

function createSolicitacaoCard(s) {
  var card = document.createElement('div')
  card.className = 'main_tudo_caixas_caixa'
  if (s && s.id) card.dataset.id = s.id

  card.innerHTML =
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Descrição da solicitação</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="descricao" value="' + escHtml(s && s.descricao) + '" placeholder="Descrição da solicitação" maxlength="500">' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Setor responsável</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="setor" value="' + escHtml(s && s.setor) + '" placeholder="Ex: Comercial, TI" maxlength="200">' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Responsável</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="responsavel" value="' + escHtml(s && (s.responsavel || s.colaborador)) + '" placeholder="Nome do responsável" maxlength="200">' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>SLA (horas)</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="number" data-field="sla" value="' + escHtml(s && (s.sla != null ? s.sla : s.tempo_horas)) + '" placeholder="Ex: 24" min="1">' +
    '</div>' +
    '<div class="card-actions">' +
      '<button class="btn-salvar">' + (s && s.id ? 'Salvar' : 'Criar solicitação') + '</button>' +
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

  var descricaoEl  = card.querySelector('[data-field="descricao"]')
  var setorEl      = card.querySelector('[data-field="setor"]')
  var responsavelEl= card.querySelector('[data-field="responsavel"]')
  var slaEl        = card.querySelector('[data-field="sla"]')

  var body = {
    descricao:   descricaoEl   ? descricaoEl.value.trim()   : '',
    setor:       setorEl       ? setorEl.value.trim()       : '',
    responsavel: responsavelEl ? responsavelEl.value.trim() : '',
    sla:         slaEl         ? Number(slaEl.value) || null : null,
  }

  saveBtn.disabled = true
  setStatus(statusEl, 'Salvando...', false)

  try {
    var url    = isNew ? '/admin/solicitacoes' : '/admin/solicitacoes/' + id
    var method = isNew ? 'POST' : 'PATCH'
    var res    = await fetch(url, {
      method: method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 401 || res.status === 403) { window.location.replace('/'); return }
    var data = await res.json().catch(function () { return {} })
    if (!res.ok) { setStatus(statusEl, (data && data.message) || 'Erro ao salvar.', true); return }
    setStatus(statusEl, isNew ? 'Solicitação criada!' : 'Salvo com sucesso!', false)
    if (isNew) loadSolicitacoes()
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
  if (!window.confirm('Deseja excluir esta solicitação?')) return

  var statusEl = card.querySelector('.card-status')
  setStatus(statusEl, 'Excluindo...', false)

  try {
    var res = await fetch('/admin/solicitacoes/' + id, { method: 'DELETE', credentials: 'include' })
    if (res.status === 401 || res.status === 403) { window.location.replace('/'); return }
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
async function loadSolicitacoes() {
  try {
    var res  = await fetch('/admin/solicitacoes', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) { window.location.replace('/'); return }
    var data = await res.json()
    renderSolicitacoes(data.solicitacoes || [])
  } catch (_e) { /* silent */ }
}

// ── Add button ────────────────────────────────────────────────────────────────
document.getElementById('main_tudo_caixas_adcionar').addEventListener('click', function () {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.insertBefore(createSolicitacaoCard(null), addBtn)
})

// ── Init ──────────────────────────────────────────────────────────────────────
checkAuth()
loadSolicitacoes()

