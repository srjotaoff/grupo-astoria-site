const form = document.getElementById('login-form')
const meBtn = document.getElementById('me-btn')
const logoutBtn = document.getElementById('logout-btn')
const result = document.getElementById('result')

function setResult(data) {
  result.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || 'Erro na requisicao')
  }

  return body
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const cpf = document.getElementById('cpf').value
  const senha = document.getElementById('senha').value

  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cpf, senha })
    })
    setResult(data)
  } catch (error) {
    setResult(error.message)
  }
})

meBtn.addEventListener('click', async () => {
  try {
    const data = await request('/auth/me')
    setResult(data)
  } catch (error) {
    setResult(error.message)
  }
})

logoutBtn.addEventListener('click', async () => {
  try {
    const data = await request('/auth/logout', { method: 'POST' })
    setResult(data)
  } catch (error) {
    setResult(error.message)
  }
})

