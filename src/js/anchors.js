(function () {
  // Smooth scroll
  const links = document.querySelectorAll('.nav__link[href^="#"]')

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const id = link.getAttribute('href').slice(1)
      const target = document.getElementById(id)
      if (!target) return

      setMenuOpen(false)

      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 70)
    })
  })

  // Mobile nav toggle: opens the dropdown holding the links + language switch
  const toggle = document.querySelector('.nav__toggle')
  const menu = document.querySelector('.nav__menu')

  function setMenuOpen (open) {
    if (!toggle || !menu) return
    menu.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      setMenuOpen(!menu.classList.contains('is-open'))
    })
  }
})()
