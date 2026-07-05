(function () {
  var menuLateral = document.getElementById('menu_lateral')
  if (!menuLateral) return

  var BASE = window.location.pathname.startsWith('/admin') ? '/admin' : ''
  var currentPath = window.location.pathname

  var links = [
    { href: BASE + '/cartaz-rotativo', label: 'Cartaz Rotativo' },
    { href: BASE + '/marcas',          label: 'Marcas do Portifólio' },
    { href: BASE + '/opcoes-menu',     label: 'Opções do Menu' },
    { href: BASE + '/solicitacao',     label: 'Gestão de Solicitação' },
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

  // Logout button as last child of nav
  var logoutBtn = document.createElement('button')
  logoutBtn.id = 'logout-menu-btn'
  logoutBtn.textContent = 'Sair'
  nav.appendChild(logoutBtn) // <- era menuLateral, agora é nav

  logoutBtn.addEventListener('click', async function () {
    try {
      await fetch(BASE + '/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      window.location.replace(BASE + '/')
    }
  })

  menuLateral.appendChild(nav)
})()