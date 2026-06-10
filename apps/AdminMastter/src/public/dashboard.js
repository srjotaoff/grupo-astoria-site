// ── Helpers ──────────────────────────────────────────────────────────────────
var userInfoEl = document.getElementById('user-info')

function redirectToLogin() { window.location.replace('/') }

async function doLogout() {
  try { await fetch('/auth/logout', { method: 'POST', credentials: 'include' }) } finally { redirectToLogin() }
}

async function checkSession() {
  try {
    var res = await fetch('/auth/me', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    if (!res.ok) return
    var data = await res.json()
    var username = data.admin && data.admin.username ? data.admin.username : '-'
    var role = data.admin && data.admin.role ? data.admin.role : '-'
    userInfoEl.innerHTML = 'Username: <span>' + username + '</span> &nbsp;|&nbsp; Perfil: <span>' + role + '</span>'
  } catch (_e) { /* silent */ }
}

async function ensureSession() {
  var authRes = await fetch('/admin/session-check', { credentials: 'include' })
  if (authRes.status === 401 || authRes.status === 403) { redirectToLogin(); return false }
  return true
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active') })
  document.getElementById(id).classList.add('active')
}

function setStatus(el, message, isError) {
  el.textContent = message
  el.style.color = isError ? '#e03131' : '#2f9e44'
}

function renderList(containerEl, items, emptyMsg) {
  if (!items.length) {
    containerEl.innerHTML = '<div class="item-row">' + emptyMsg + '</div>'
    return
  }
  containerEl.innerHTML = items.map(function (item) {
    return (
      '<div class="item-row">' +
      '<span>' + item.nome + '</span>' +
      '<div class="item-actions">' +
      '<button class="icon-btn" data-action="edit" data-id="' + item.id + '" title="Editar">🖌️</button>' +
      '<button class="icon-btn danger" data-action="delete" data-id="' + item.id + '" title="Excluir">🗑️</button>' +
      '</div>' +
      '</div>'
    )
  }).join('')
}

// ── HOME ──────────────────────────────────────────────────────────────────────
document.getElementById('home-parceiros-btn').addEventListener('click', function () {
  showScreen('screen-parceiros')
  loadParceiros()
})
document.getElementById('home-banners-btn').addEventListener('click', function () {
  showScreen('screen-banners')
  loadBanners()
})
document.getElementById('logout-btn-home').addEventListener('click', doLogout)

// ── PARCEIROS ─────────────────────────────────────────────────────────────────
var parceiroListEl   = document.getElementById('parceiro-list')
var parceiroFormEl   = document.getElementById('parceiro-form')
var parceiroNomeEl   = document.getElementById('p-nome')
var parceiroDescEl   = document.getElementById('p-descricao')
var parceiroEmpEl    = document.getElementById('p-empresa')
var parceiroImgEl    = document.getElementById('p-imagem')
var parceiroSaveBtn  = document.getElementById('p-save-btn')
var parceiroStatusEl = document.getElementById('parceiro-status')
var parceiroEditingId = null

document.getElementById('back-from-parceiros').addEventListener('click', function () {
  closeParceiro()
  showScreen('screen-home')
})
document.getElementById('logout-btn-parceiros').addEventListener('click', doLogout)
document.getElementById('parceiro-add-btn').addEventListener('click', openParceiroForCreate)
document.getElementById('p-cancel-btn').addEventListener('click', closeParceiro)
parceiroFormEl.addEventListener('submit', submitParceiroForm)

parceiroListEl.addEventListener('click', function (e) {
  var target = e.target
  if (!target || !target.dataset) return
  var id = Number(target.dataset.id)
  if (!Number.isInteger(id) || id <= 0) return
  if (target.dataset.action === 'edit') loadParceiroForEdit(id)
  if (target.dataset.action === 'delete') deleteParceiroById(id)
})

function openParceiroForCreate() {
  parceiroEditingId = null
  parceiroFormEl.reset()
  parceiroFormEl.classList.add('visible')
  parceiroSaveBtn.textContent = 'Salvar parceiro'
}

function openParceiroForEdit(item) {
  parceiroEditingId = item.id
  parceiroNomeEl.value = item.nome || ''
  parceiroDescEl.value = item.descricao || ''
  parceiroEmpEl.value = item.empresa || ''
  parceiroImgEl.value = ''
  parceiroFormEl.classList.add('visible')
  parceiroSaveBtn.textContent = 'Atualizar parceiro'
}

function closeParceiro() {
  parceiroEditingId = null
  parceiroFormEl.reset()
  parceiroFormEl.classList.remove('visible')
  parceiroSaveBtn.textContent = 'Salvar parceiro'
}

async function loadParceiros() {
  try {
    var res = await fetch('/admin/empresas', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = await res.json()
    if (!res.ok) return setStatus(parceiroStatusEl, (data && data.message) || 'Falha ao carregar parceiros.', true)
    renderList(parceiroListEl, data.empresas || [], 'Nenhum parceiro cadastrado.')
  } catch (_e) { setStatus(parceiroStatusEl, 'Sem conexao com o servidor.', true) }
}

async function loadParceiroForEdit(id) {
  try {
    var res = await fetch('/admin/empresas/' + id, { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = await res.json()
    if (!res.ok) return setStatus(parceiroStatusEl, (data && data.message) || 'Falha ao carregar parceiro.', true)
    openParceiroForEdit(data.empresa)
  } catch (_e) { setStatus(parceiroStatusEl, 'Sem conexao com o servidor.', true) }
}

async function deleteParceiroById(id) {
  if (!window.confirm('Deseja excluir este parceiro?')) return
  try {
    var res = await fetch('/admin/empresas/' + id, { method: 'DELETE', credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = null; try { data = await res.json() } catch (_) {}
    if (!res.ok) return setStatus(parceiroStatusEl, (data && data.message) || 'Falha ao excluir.', true)
    setStatus(parceiroStatusEl, 'Parceiro excluido com sucesso.', false)
    if (parceiroEditingId === id) closeParceiro()
    loadParceiros()
  } catch (_e) { setStatus(parceiroStatusEl, 'Sem conexao com o servidor.', true) }
}

async function submitParceiroForm(event) {
  event.preventDefault()
  var nome = (parceiroNomeEl.value || '').trim()
  var descricao = (parceiroDescEl.value || '').trim()
  var empresa = (parceiroEmpEl.value || '').trim()
  var file = parceiroImgEl.files && parceiroImgEl.files[0]

  if (file && file.size > 15 * 1024 * 1024) return setStatus(parceiroStatusEl, 'A imagem deve ter no maximo 15MB.', true)
  if (!parceiroEditingId && (!nome || !descricao || !empresa || !file)) return setStatus(parceiroStatusEl, 'Preencha todos os campos para criar.', true)
  if (parceiroEditingId && !nome && !descricao && !empresa && !file) return setStatus(parceiroStatusEl, 'Informe ao menos um campo para atualizar.', true)

  parceiroSaveBtn.disabled = true
  setStatus(parceiroStatusEl, parceiroEditingId ? 'Atualizando...' : 'Salvando...', false)
  try {
    if (!(await ensureSession())) return
    var fd = new FormData()
    if (nome) fd.append('nome', nome)
    if (descricao) fd.append('descricao', descricao)
    if (empresa) fd.append('empresa', empresa)
    if (file) fd.append('imagem', file)
    var endpoint = parceiroEditingId ? '/admin/empresas/' + parceiroEditingId : '/admin/empresas'
    var res = await fetch(endpoint, { method: parceiroEditingId ? 'PATCH' : 'POST', credentials: 'include', body: fd })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = null; try { data = await res.json() } catch (_) {}
    if (!res.ok) return setStatus(parceiroStatusEl, (data && data.message) || 'Falha ao salvar.', true)
    setStatus(parceiroStatusEl, parceiroEditingId ? 'Parceiro atualizado com sucesso.' : 'Parceiro cadastrado com sucesso.', false)
    closeParceiro()
    loadParceiros()
  } catch (_e) { setStatus(parceiroStatusEl, 'Sem conexao com o servidor.', true) }
  finally { parceiroSaveBtn.disabled = false }
}

// ── BANNERS ───────────────────────────────────────────────────────────────────
var bannerListEl   = document.getElementById('banner-list')
var bannerFormEl   = document.getElementById('banner-form')
var bannerNomeEl   = document.getElementById('b-nome')
var bannerEmpEl    = document.getElementById('b-empresa')
var bannerImgEl    = document.getElementById('b-imagem')
var bannerSaveBtn  = document.getElementById('b-save-btn')
var bannerStatusEl = document.getElementById('banner-status')
var bannerEditingId = null

document.getElementById('back-from-banners').addEventListener('click', function () {
  closeBanner()
  showScreen('screen-home')
})
document.getElementById('logout-btn-banners').addEventListener('click', doLogout)
document.getElementById('banner-add-btn').addEventListener('click', openBannerForCreate)
document.getElementById('b-cancel-btn').addEventListener('click', closeBanner)
bannerFormEl.addEventListener('submit', submitBannerForm)

bannerListEl.addEventListener('click', function (e) {
  var target = e.target
  if (!target || !target.dataset) return
  var id = Number(target.dataset.id)
  if (!Number.isInteger(id) || id <= 0) return
  if (target.dataset.action === 'edit') loadBannerForEdit(id)
  if (target.dataset.action === 'delete') deleteBannerById(id)
})

function openBannerForCreate() {
  bannerEditingId = null
  bannerFormEl.reset()
  bannerFormEl.classList.add('visible')
  bannerSaveBtn.textContent = 'Salvar banner'
}

function openBannerForEdit(item) {
  bannerEditingId = item.id
  bannerNomeEl.value = item.nome || ''
  bannerEmpEl.value = item.empresa || ''
  bannerImgEl.value = ''
  bannerFormEl.classList.add('visible')
  bannerSaveBtn.textContent = 'Atualizar banner'
}

function closeBanner() {
  bannerEditingId = null
  bannerFormEl.reset()
  bannerFormEl.classList.remove('visible')
  bannerSaveBtn.textContent = 'Salvar banner'
}

async function loadBanners() {
  try {
    var res = await fetch('/admin/banners', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = await res.json()
    if (!res.ok) return setStatus(bannerStatusEl, (data && data.message) || 'Falha ao carregar banners.', true)
    renderList(bannerListEl, data.banners || [], 'Nenhum banner cadastrado.')
  } catch (_e) { setStatus(bannerStatusEl, 'Sem conexao com o servidor.', true) }
}

async function loadBannerForEdit(id) {
  try {
    var res = await fetch('/admin/banners/' + id, { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = await res.json()
    if (!res.ok) return setStatus(bannerStatusEl, (data && data.message) || 'Falha ao carregar banner.', true)
    openBannerForEdit(data.banner)
  } catch (_e) { setStatus(bannerStatusEl, 'Sem conexao com o servidor.', true) }
}

async function deleteBannerById(id) {
  if (!window.confirm('Deseja excluir este banner?')) return
  try {
    var res = await fetch('/admin/banners/' + id, { method: 'DELETE', credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = null; try { data = await res.json() } catch (_) {}
    if (!res.ok) return setStatus(bannerStatusEl, (data && data.message) || 'Falha ao excluir.', true)
    setStatus(bannerStatusEl, 'Banner excluido com sucesso.', false)
    if (bannerEditingId === id) closeBanner()
    loadBanners()
  } catch (_e) { setStatus(bannerStatusEl, 'Sem conexao com o servidor.', true) }
}

async function submitBannerForm(event) {
  event.preventDefault()
  var nome = (bannerNomeEl.value || '').trim()
  var empresa = (bannerEmpEl.value || '').trim()
  var file = bannerImgEl.files && bannerImgEl.files[0]

  if (file && file.size > 15 * 1024 * 1024) return setStatus(bannerStatusEl, 'A imagem deve ter no maximo 15MB.', true)
  if (!bannerEditingId && (!nome || !empresa || !file)) return setStatus(bannerStatusEl, 'Preencha todos os campos para criar.', true)
  if (bannerEditingId && !nome && !empresa && !file) return setStatus(bannerStatusEl, 'Informe ao menos um campo para atualizar.', true)

  bannerSaveBtn.disabled = true
  setStatus(bannerStatusEl, bannerEditingId ? 'Atualizando...' : 'Salvando...', false)
  try {
    if (!(await ensureSession())) return
    var fd = new FormData()
    if (nome) fd.append('nome', nome)
    if (empresa) fd.append('empresa', empresa)
    if (file) fd.append('imagem', file)
    var endpoint = bannerEditingId ? '/admin/banners/' + bannerEditingId : '/admin/banners'
    var res = await fetch(endpoint, { method: bannerEditingId ? 'PATCH' : 'POST', credentials: 'include', body: fd })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var data = null; try { data = await res.json() } catch (_) {}
    if (!res.ok) return setStatus(bannerStatusEl, (data && data.message) || 'Falha ao salvar.', true)
    setStatus(bannerStatusEl, bannerEditingId ? 'Banner atualizado com sucesso.' : 'Banner cadastrado com sucesso.', false)
    closeBanner()
    loadBanners()
  } catch (_e) { setStatus(bannerStatusEl, 'Sem conexao com o servidor.', true) }
  finally { bannerSaveBtn.disabled = false }
}

// ── Init ──────────────────────────────────────────────────────────────────────
checkSession()
setInterval(checkSession, 2 * 60 * 1000)
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') checkSession() })
