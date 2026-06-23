// Detecta se o Admin está sendo servido sob um subpath (ex: /admin/)
var BASE_PATH = (function () {
  var match = window.location.pathname.match(/^(\/admin)\b/)
  return match ? match[1] : ''
})()
