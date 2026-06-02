var cpfInput   = document.getElementById('cpf')
var senhaInput = document.getElementById('senha')
var acessarBtn = document.getElementById('acessar-btn')
var errorMsg   = document.getElementById('error-msg')

function showError(msg) {
  if (errorMsg) { errorMsg.textContent = msg }
}

if (acessarBtn) {
  acessarBtn.addEventListener('click', async function () {
    var cpf   = cpfInput  ? cpfInput.value.trim()   : ''
    var senha = senhaInput ? senhaInput.value.trim() : ''

    if (!cpf || !senha) { showError('Preencha usuário e senha.'); return }

    acessarBtn.disabled = true
    showError('')

    try {
      var res = await fetch('/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpf, senha: senha })
      })

      var body = await res.json().catch(function () { return {} })

      if (!res.ok) {
        showError(body.message || 'Usuário ou senha incorretos.')
        return
      }

      // Send admin to the menu hub first, where they can choose the section to manage.
      window.location.replace('/opcoes-menu')
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
