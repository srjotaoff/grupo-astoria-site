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
function renderBanners(banners) {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.querySelectorAll('.main_tudo_caixas_caixa').forEach(function (el) { el.remove() })
  banners.forEach(function (banner) {
    container.insertBefore(createBannerCard(banner), addBtn)
  })
}

function createBannerCard(banner) {
  var card = document.createElement('div')
  card.className = 'main_tudo_caixas_caixa'
  if (banner && banner.id) card.dataset.id = banner.id

  var imgUrl = banner && banner.id ? BASE_PATH + '/admin/banners/' + banner.id + '/imagem' : ''

  card.innerHTML =
    '<div class="main_tudo_caixas_caixa_img" title="Clique para alterar imagem">' +
      (imgUrl
        ? '<img class="img-preview" src="' + escHtml(imgUrl) + '" alt="banner" onerror="this.remove()">'
        : '') +
      '<p>' + (imgUrl ? '' : '+') + '</p>' +
      '<div class="img-overlay">Trocar imagem</div>' +
      '<input type="file" class="card-file-input" accept="image/*" hidden>' +
    '</div>' +
    '<div class="main_tudo_caixas_caixa_conjunto">' +
      '<label>Nome do banner</label>' +
      '<input class="main_tudo_caixas_caixa_texto" type="text" data-field="nome" value="' + escHtml(banner && banner.nome) + '" placeholder="Nome do banner">' +
    '</div>' +
    '<div class="card-actions">' +
      '<button class="btn-salvar">' + (banner && banner.id ? 'Salvar' : 'Criar banner') + '</button>' +
      '<img class="main_tudo_caixas_caixa_lixeira" src="images/icones/lixeira.svg" alt="Excluir">' +
    '</div>' +
    '<p class="card-status"></p>'

  wireCard(card, 'banner')
  return card
}

function wireCard(card, type) {
  var imgArea   = card.querySelector('.main_tudo_caixas_caixa_img')
  var fileInput = card.querySelector('.card-file-input')
  var saveBtn   = card.querySelector('.btn-salvar')
  var delBtn    = card.querySelector('.main_tudo_caixas_caixa_lixeira')

  if (imgArea && fileInput) {
    imgArea.addEventListener('click', function () { fileInput.click() })
    fileInput.addEventListener('change', function () {
      if (!fileInput.files || !fileInput.files[0]) return
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
  var nome = card.querySelector('[data-field="nome"]')
  if (nome) fd.append('nome', nome.value.trim())
  if (fileInput && fileInput.files && fileInput.files[0]) fd.append('imagem', fileInput.files[0])

  saveBtn.disabled = true
  setStatus(statusEl, 'Salvando...', false)

  try {
    var url    = isNew ? BASE_PATH + '/admin/banners' : BASE_PATH + '/admin/banners/' + id
    var method = isNew ? 'POST' : 'PATCH'
    var res    = await fetch(url, { method: method, credentials: 'include', body: fd })
    if (res.status === 401 || res.status === 403) { window.location.replace(BASE_PATH + '/'); return }
    var data   = await res.json().catch(function () { return {} })
    if (!res.ok) { setStatus(statusEl, (data && data.message) || 'Erro ao salvar.', true); return }
    setStatus(statusEl, isNew ? 'Banner criado!' : 'Salvo com sucesso!', false)
    if (isNew) loadBanners()
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
  if (!window.confirm('Deseja excluir este banner?')) return

  var statusEl = card.querySelector('.card-status')
  setStatus(statusEl, 'Excluindo...', false)

  try {
    var res = await fetch(BASE_PATH + '/admin/banners/' + id, { method: 'DELETE', credentials: 'include' })
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
async function loadBanners() {
  try {
    var res  = await fetch(BASE_PATH + '/admin/banners', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) { window.location.replace(BASE_PATH + '/'); return }
    var data = await res.json()
    renderBanners(data.banners || [])
  } catch (_e) { /* silent */ }
}

// ── Add button ────────────────────────────────────────────────────────────────
document.getElementById('main_tudo_caixas_adcionar').addEventListener('click', function () {
  var container = document.getElementById('main_tudo_caixas')
  var addBtn    = document.getElementById('main_tudo_caixas_adcionar')
  container.insertBefore(createBannerCard(null), addBtn)
})

// ── Init ──────────────────────────────────────────────────────────────────────
checkAuth()
loadBanners()

