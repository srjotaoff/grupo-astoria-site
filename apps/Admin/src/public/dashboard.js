var userInfoEl = document.getElementById('user-info')
var logoutBtn = document.getElementById('logout-btn')
var statusMsg = document.getElementById('status-msg')
var formEl = document.getElementById('empresa-form')
var nomeEl = document.getElementById('nome')
var descricaoEl = document.getElementById('descricao')
var parceiroEl = document.getElementById('parceiro')
var imagemEl = document.getElementById('imagem')
var saveBtn = document.getElementById('save-btn')
var cancelBtn = document.getElementById('cancel-btn')
var addNewBtn = document.getElementById('add-new-btn')
var empresaListEl = document.getElementById('empresa-list')

var editingId = null

function redirectToLogin() { window.location.replace('/') }

function setStatus(message, isError) {
  statusMsg.textContent = message
  statusMsg.style.color = isError ? '#e03131' : '#2f9e44'
}

function openFormForCreate() {
  editingId = null
  formEl.classList.add('visible')
  formEl.reset()
  saveBtn.textContent = 'Salvar empresa'
}

function openFormForEdit(empresa) {
  editingId = empresa.id
  formEl.classList.add('visible')
  nomeEl.value = empresa.nome || ''
  descricaoEl.value = empresa.descricao || ''
  parceiroEl.value = empresa.parceiro || ''
  imagemEl.value = ''
  saveBtn.textContent = 'Atualizar empresa'
}

function closeForm() {
  editingId = null
  formEl.reset()
  formEl.classList.remove('visible')
  saveBtn.textContent = 'Salvar empresa'
}

async function checkSession() {
  try {
    var res = await fetch('/auth/me', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    if (!res.ok) return setStatus('Erro ao verificar sessao.', true)
    var data = await res.json()
    var cpf = data.admin && data.admin.cpf ? data.admin.cpf : '-'
    var role = data.admin && data.admin.role ? data.admin.role : '-'
    userInfoEl.innerHTML = 'CPF: <span>' + cpf + '</span> &nbsp;|&nbsp; Perfil: <span>' + role + '</span>'
  } catch (_e) {
    setStatus('Sem conexao com o servidor.', true)
  }
}

async function ensureSession() {
  var authRes = await fetch('/admin/session-check', { credentials: 'include' })
  if (authRes.status === 401 || authRes.status === 403) {
    redirectToLogin()
    return false
  }
  return true
}

function renderEmpresas(empresas) {
  if (!empresas.length) {
    empresaListEl.innerHTML = '<div class="empresa-row">Nenhuma empresa cadastrada.</div>'
    return
  }

  empresaListEl.innerHTML = empresas
    .map(function (item) {
      return (
        '<div class="empresa-row">' +
        '<span>' + item.nome + '</span>' +
        '<div class="empresa-actions">' +
        '<button class="icon-btn" data-action="edit" data-id="' + item.id + '" title="Editar">🖌️</button>' +
        '<button class="icon-btn danger" data-action="delete" data-id="' + item.id + '" title="Excluir">🗑️</button>' +
        '</div>' +
        '</div>'
      )
    })
    .join('')
}

async function loadEmpresas() {
  try {
    var res = await fetch('/admin/empresas', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var payload = await res.json()
    if (!res.ok) return setStatus((payload && payload.message) || 'Falha ao carregar empresas.', true)
    renderEmpresas(payload.empresas || [])
  } catch (_e) {
    setStatus('Sem conexao com o servidor.', true)
  }
}

async function loadEmpresaForEdit(id) {
  try {
    var res = await fetch('/admin/empresas/' + id, { credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var payload = await res.json()
    if (!res.ok) return setStatus((payload && payload.message) || 'Falha ao carregar empresa.', true)
    openFormForEdit(payload.empresa)
  } catch (_e) {
    setStatus('Sem conexao com o servidor.', true)
  }
}

async function deleteEmpresaById(id) {
  if (!window.confirm('Deseja excluir esta empresa?')) return
  try {
    var res = await fetch('/admin/empresas/' + id, { method: 'DELETE', credentials: 'include' })
    if (res.status === 401 || res.status === 403) return redirectToLogin()
    var payload = null
    try { payload = await res.json() } catch (_ignored) { payload = null }
    if (!res.ok) return setStatus((payload && payload.message) || 'Falha ao excluir empresa.', true)
    setStatus('Empresa excluida com sucesso.', false)
    if (editingId === id) closeForm()
    loadEmpresas()
  } catch (_e) {
    setStatus('Sem conexao com o servidor.', true)
  }
}

function buildPayload() {
  var nome = (nomeEl.value || '').trim()
  var descricao = (descricaoEl.value || '').trim()
  var parceiro = (parceiroEl.value || '').trim()
  var file = imagemEl.files && imagemEl.files[0]

  if (file && file.size > 15 * 1024 * 1024) {
    setStatus('A imagem deve ter no maximo 15MB.', true)
    return null
  }

  if (!editingId && (!nome || !descricao || !parceiro || !file)) {
    setStatus('Preencha todos os campos obrigatorios para criar.', true)
    return null
  }

  if (editingId && !nome && !descricao && !parceiro && !file) {
    setStatus('Informe ao menos um campo para atualizar.', true)
    return null
  }

  return { nome: nome, descricao: descricao, parceiro: parceiro, file: file }
}

async function submitEmpresaForm(event) {
  event.preventDefault()
  var validData = buildPayload()
  if (!validData) return

  saveBtn.disabled = true
  setStatus(editingId ? 'Atualizando empresa...' : 'Salvando empresa...', false)

  try {
    if (!(await ensureSession())) return

    var formData = new FormData()
    if (validData.nome) formData.append('nome', validData.nome)
    if (validData.descricao) formData.append('descricao', validData.descricao)
    if (validData.parceiro) formData.append('parceiro', validData.parceiro)
    if (validData.file) formData.append('imagem', validData.file)

    var endpoint = editingId ? '/admin/empresas/' + editingId : '/admin/empresas'
    var method = editingId ? 'PATCH' : 'POST'

    var res = await fetch(endpoint, { method: method, credentials: 'include', body: formData })
    if (res.status === 401 || res.status === 403) return redirectToLogin()

    var payload = null
    try { payload = await res.json() } catch (_e) { payload = null }
    if (!res.ok) return setStatus((payload && payload.message) || 'Falha ao salvar empresa.', true)

    setStatus(editingId ? 'Empresa atualizada com sucesso.' : 'Empresa cadastrada com sucesso.', false)
    closeForm()
    loadEmpresas()
  } catch (_error) {
    setStatus('Sem conexao com o servidor.', true)
  } finally {
    saveBtn.disabled = false
  }
}

logoutBtn.addEventListener('click', async function () {
  try { await fetch('/auth/logout', { method: 'POST', credentials: 'include' }) } finally { redirectToLogin() }
})

addNewBtn.addEventListener('click', function () { openFormForCreate() })
cancelBtn.addEventListener('click', function () { closeForm() })

empresaListEl.addEventListener('click', function (event) {
  var target = event.target
  if (!target || !target.dataset) return
  var action = target.dataset.action
  var id = Number(target.dataset.id)
  if (!Number.isInteger(id) || id <= 0) return
  if (action === 'edit') loadEmpresaForEdit(id)
  if (action === 'delete') deleteEmpresaById(id)
})

if (formEl) formEl.addEventListener('submit', submitEmpresaForm)

checkSession()
loadEmpresas()

setInterval(checkSession, 2 * 60 * 1000)
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') checkSession() })
