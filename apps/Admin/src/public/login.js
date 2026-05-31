const form = document.getElementById('login-form')
const result = document.getElementById('result')

function setResult(data) {
  result.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
}

async function request(url, options) {
  if (!options) { options = {} }
  const response = await fetch(url, Object.assign(
    { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
    options
  ))
  const body = await response.json().catch(function () { return {} })
  if (!response.ok) {
    var err = new Error(body.message ? body.message : 'Erro na requisicao')
    err.status = response.status
    throw err
  }
  return body
}

form.addEventListener('submit', async function (event) {
  event.preventDefault()
  var cpf = document.getElementById('cpf').value
  var senha = document.getElementById('senha').value
  try {
    await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cpf: cpf, senha: senha })
    })
    window.location.replace('/dashboard')
  } catch (error) {
    if (error.status === 409) {
      setResult('[Sessao ativa] ' + error.message)
    } else {
      setResult(error.message)
    }
  }
})
