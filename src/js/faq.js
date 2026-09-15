// FAQ: on mobile the answers are collapsed by CSS (below $bp-md); clicking a
// question opens / closes its answer. On desktop everything stays visible.
;(function () {
  document.querySelectorAll('.faq__toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.faq__item')
      const isOpen = item.classList.toggle('is-open')
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    })
  })
})()
