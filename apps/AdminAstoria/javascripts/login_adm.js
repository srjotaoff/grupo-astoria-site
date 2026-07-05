// When served under a sub-path (e.g. mastter.com.br/admin/), prefix all
// fetch and navigation paths so requests are not routed to the wrong app.
var BASE = window.location.pathname.startsWith('/admin') ? '/admin' : ''

var usernameInput = document.getElementById('username')
var senhaInput = document.getElementById('senha')
var acessarBtn = document.getElementById('acessar-btn')
var errorMsg   = document.getElementById('error-msg')

function showError(msg) {
  if (errorMsg) { errorMsg.textContent = msg }
}

async function redirectIfAlreadyAuthenticated() {
  try {
    var res = await fetch(BASE + '/auth/me', { credentials: 'include' })
    if (res.ok) {
      window.location.replace(BASE + '/opcoes-menu')
    }
  } catch (_e) {
    // keep login page when server is unavailable
  }
}

redirectIfAlreadyAuthenticated()

if (acessarBtn) {
  acessarBtn.addEventListener('click', async function () {
    var username = usernameInput ? usernameInput.value.trim() : ''
    var senha = senhaInput ? senhaInput.value.trim() : ''

    if (!username || !senha) { showError('Preencha usuário e senha.'); return }

    acessarBtn.disabled = true
    showError('')

    try {
      var res = await fetch(BASE + '/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, senha: senha })
      })

      var body = await res.json().catch(function () { return {} })

      if (!res.ok) {
        showError(body.message || 'Usuário ou senha incorretos.')
        return
      }

      // Send admin to the menu hub first, where they can choose the section to manage.
      window.location.replace(BASE + '/opcoes-menu')
    } catch (_e) {
      showError('Sem conexão com o servidor.')
    } finally {
      acessarBtn.disabled = false
    }
  })
}

// Allow Enter key
if (senhaInput) {
  senhaInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && acessarBtn) acessarBtn.click()
  })
}
