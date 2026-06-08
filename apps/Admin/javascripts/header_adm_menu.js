(function () {
  var menuLateral = document.getElementById('menu_lateral')
  if (!menuLateral) return

  var currentPath = window.location.pathname

  var links = [
    { href: '/cartaz-rotativo', label: 'Cartaz Rotativo' },
    { href: '/marcas',          label: 'Marcas do Portifólio' },
    { href: '/opcoes-menu',     label: 'Opções do Menu' },
    { href: '/solicitacao',     label: 'Gestão de Solicitação' },
    { label: 'Sair', action: 'logout' },
  ]

  var nav = document.createElement('nav')
  nav.id = 'header'

  links.forEach(function (link) {
    var a   = document.createElement('a')
    var btn = document.createElement('button')
    a.href  = link.href
    btn.textContent = link.label
    if (link.id) btn.id = link.id
    if (currentPath === link.href) btn.classList.add('active')
    a.appendChild(btn)
    nav.appendChild(a)
  })

  menuLateral.appendChild(nav)

  document.getElementById('logout-menu-btn')
    .addEventListener('click', async function (e) {
      e.preventDefault()
      try {
        await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
      } finally {
        window.location.replace('/')
      }
    })
})()