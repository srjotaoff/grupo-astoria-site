var userInfoEl = document.getElementById('user-info')
var logoutBtn = document.getElementById('logout-btn')
var statusMsg = document.getElementById('status-msg')

function redirectToLogin() {
  window.location.replace('/')
}

async function checkSession() {
  try {
    var res = await fetch('/auth/me', { credentials: 'include' })
    if (res.status === 401 || res.status === 403) {
      redirectToLogin()
      return
    }
    if (!res.ok) {
      statusMsg.textContent = 'Erro ao verificar sessao.'
      return
    }
    var data = await res.json()
    var cpf = data.admin && data.admin.cpf ? data.admin.cpf : '-'
    var role = data.admin && data.admin.role ? data.admin.role : '-'
    userInfoEl.innerHTML = 'CPF: <span>' + cpf + '</span> &nbsp;|&nbsp; Perfil: <span>' + role + '</span>'
  } catch (e) {
    statusMsg.textContent = 'Sem conexao com o servidor.'
  }
}

logoutBtn.addEventListener('click', async function () {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
  } finally {
    redirectToLogin()
  }
})

checkSession()

setInterval(checkSession, 2 * 60 * 1000)

document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    checkSession()
  }
})
