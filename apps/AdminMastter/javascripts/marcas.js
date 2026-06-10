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
function renderMarcas(parceiros) {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.querySelectorAll('.main_tudo_caixas_caixa').forEach(function (el) { el.remove() })
  parceiros.forEach(function (p) {
    container.insertBefore(createMarcaCard(p), addBtn)
  })
}

function createMarcaCard(parceiro) {
  var card = document.createElement('div')
  card.className = 'main_tudo_caixas_caixa'
  if (parceiro && parceiro.id) card.dataset.id = parceiro.id

  var imgUrl = parceiro && parceiro.id ? '/admin/empresas/' + parceiro.id + '/imagem' : ''

  card.innerHTML =
    '<div class="main_tudo_caixas_caixa_img" title="Clique para alterar imagem">' +
      (imgUrl
        ? '<img class="img-preview" src="' + escHtml(imgUrl) + '" alt="marca" onerror="this.remove()">'
        : '') +
      '<p>' + (imgUrl ? '' : '+') + '</p>' +
      '<div class="img-overlay">Trocar imagem</div>' +
      '<input type="file" class="card-file-input" accept="image/*" hidden>' +
    '</div>' +
    '<div class="upload-actions">' +
      '<button type="button" class="btn-upload">Carregar imagem</button>' +
      '<span class="upload-filename">Nenhum arquivo selecionado</span>' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Nome da marca</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="nome" value="' + escHtml(parceiro && parceiro.nome) + '" placeholder="Nome da marca">' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Descrição da marca</label>' +
      '<textarea class="main_tudo_caixas_caixa_texto" data-field="descricao" placeholder="Descrição..." maxlength="1000">' + escHtml(parceiro && parceiro.descricao) + '</textarea>' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>URL do site da marca</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="url" data-field="url" value="' + escHtml(parceiro && parceiro.url) + '" placeholder="https://...">' +
    '</div>' +
    '<div class="card-actions">' +
      '<button class="btn-salvar">' + (parceiro && parceiro.id ? 'Salvar' : 'Criar marca') + '</button>' +
      '<img class="main_tudo_caixas_caixa_lixeira" src="images/icones/lixeira.svg" alt="Excluir">' +
    '</div>' +
    '<p class="card-status"></p>'

  wireCard(card)
  return card
}

function wireCard(card) {
  var imgArea   = card.querySelector('.main_tudo_caixas_caixa_img')
  var fileInput = card.querySelector('.card-file-input')
  var uploadBtn = card.querySelector('.btn-upload')
  var fileName  = card.querySelector('.upload-filename')
  var saveBtn   = card.querySelector('.btn-salvar')
  var delBtn    = card.querySelector('.main_tudo_caixas_caixa_lixeira')

  if (imgArea && fileInput) {
    imgArea.addEventListener('click', function () { fileInput.click() })
    if (uploadBtn) uploadBtn.addEventListener('click', function () { fileInput.click() })
    fileInput.addEventListener('change', function () {
      if (!fileInput.files || !fileInput.files[0]) return
      if (fileName) fileName.textContent = fileInput.files[0].name
      var reader = new FileReader()
      reader.onload = function (e) {
        var preview = imgArea.querySelector('.img-preview')
        if (!preview) {
          preview = document.createElement('img')
          preview.className = 'img-preview'
          imgArea.prepend(preview)
        }
        preview.src = e.target.result
        var plus = imgArea.querySelector('p')
        if (plus) plus.textContent = ''
      }
      reader.readAsDataURL(fileInput.files[0])
    })
  }

  if (saveBtn) saveBtn.addEventListener('click', function () { saveCard(card) })
  if (delBtn)  delBtn.addEventListener('click',  function () { deleteCard(card) })
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function saveCard(card) {
  var id        = card.dataset.id ? Number(card.dataset.id) : null
  var isNew     = !id
  var statusEl  = card.querySelector('.card-status')
  var saveBtn   = card.querySelector('.btn-salvar')
  var fileInput = card.querySelector('.card-file-input')

  var fd = new FormData()
  var nome     = card.querySelector('[data-field="nome"]')
  var descricao= card.querySelector('[data-field="descricao"]')
  var url      = card.querySelector('[data-field="url"]')
  if (nome)     fd.append('nome',     nome.value.trim())
  if (descricao)fd.append('descricao',descricao.value.trim())
  if (url)      fd.append('url',      url.value.trim())
  var hasNewImage = Boolean(fileInput && fileInput.files && fileInput.files[0])
  if (hasNewImage) fd.append('imagem', fileInput.files[0])

  if (isNew && !hasNewImage) {
    setStatus(statusEl, 'Selecione uma imagem para criar a marca.', true)
    return
  }

  saveBtn.disabled = true
  setStatus(statusEl, 'Salvando...', false)

  try {
    var url    = isNew ? '/admin/empresas' : '/admin/empresas/' + id
    var method = isNew ? 'POST' : 'PATCH'
    var res    = await fetch(url, { method: method, credentials: 'include', body: fd })
    if (res.status === 401 || res.status === 403) { window.location.replace('/'); return }
    var data   = await res.json().catch(function () { return {} })
    if (!res.ok) { setStatus(statusEl, (data && data.message) || 'Erro ao salvar.', true); return }
    setStatus(statusEl, isNew ? 'Marca criada!' : 'Salvo com sucesso!', false)
    if (isNew) loadMarcas()
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
  if (!window.confirm('Deseja excluir esta marca?')) return

  var statusEl = card.querySelector('.card-status')
  setStatus(statusEl, 'Excluindo...', false)

  try {
    var res = await fetch('/admin/empresas/' + id, { method: 'DELETE', credentials: 'include' })
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
async function loadMarcas() {
  try {
    var res  = await fetch('/admin/empresas', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) { window.location.replace('/'); return }
    var data = await res.json()
    renderMarcas(data.empresas || [])
  } catch (_e) { /* silent */ }
}

// ── Add button ────────────────────────────────────────────────────────────────
document.getElementById('main_tudo_caixas_adcionar').addEventListener('click', function () {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.insertBefore(createMarcaCard(null), addBtn)
})

// ── Init ──────────────────────────────────────────────────────────────────────
checkAuth()
loadMarcas()
