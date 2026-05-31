(function () {
  var menuLateral = document.getElementById('menu_lateral')
  if (!menuLateral) return

  var currentPath = window.location.pathname

  var links = [
    { href: '/cartaz-rotativo', label: '🖼️  Cartaz Rotativo' },
    { href: '/marcas',          label: '🤝  Marcas do Portifólio' },
    { href: '/opcoes-menu',     label: '☰  Opções do Menu' },
  ]

  var nav = document.createElement('nav')
  nav.id = 'header'

  links.forEach(function (link) {
    var a   = document.createElement('a')
    var btn = document.createElement('button')
    a.href  = link.href
    btn.textContent = link.label
    if (currentPath === link.href) btn.classList.add('active')
    a.appendChild(btn)
    nav.appendChild(a)
  })

  menuLateral.appendChild(nav)

  // Logout button at bottom
  var logoutBtn = document.createElement('button')
  logoutBtn.id = 'logout-menu-btn'
  logoutBtn.textContent = '⏻  Sair'
  menuLateral.appendChild(logoutBtn)

  logoutBtn.addEventListener('click', async function () {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      window.location.replace('/')
    }
  })
})()

