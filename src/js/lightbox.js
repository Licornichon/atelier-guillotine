const GLightbox = require('glightbox')
require('glightbox/dist/css/glightbox.min.css')

;(function () {
  const items = document.querySelectorAll('.gallery__item')
  if (!items.length) return

  const lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    keyboardNavigation: true,
    closeOnOutsideClick: true,
    openEffect: 'fade',
    closeEffect: 'fade',
  })

  items.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault()
      const href = item.getAttribute('href')
      if (!href || href === '#') return

      const visible = Array.from(document.querySelectorAll('.gallery__item:not(.is-hidden)'))
        .filter(el => el.getAttribute('href') && el.getAttribute('href') !== '#')
      const elements = visible.map(el => ({ href: el.getAttribute('href'), type: 'image' }))
      const startAt = visible.indexOf(item)

      lightbox.setElements(elements)
      lightbox.openAt(startAt)
    })
  })
})()

// Shop — the card's main photo opens that piece's photos full screen
// (data-shop-images = JSON list), starting at the photo currently shown
// (its href follows the thumbnail picked, see shop.js)
;(function () {
  const photos = document.querySelectorAll('.shop__photo[data-shop-images]')
  if (!photos.length) return

  const lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    keyboardNavigation: true,
    closeOnOutsideClick: true,
    openEffect: 'fade',
    closeEffect: 'fade',
  })

  photos.forEach(photo => {
    photo.addEventListener('click', e => {
      e.preventDefault()
      let images
      try {
        images = JSON.parse(photo.getAttribute('data-shop-images'))
      } catch (err) {
        return
      }
      if (!images.length) return

      lightbox.setElements(images.map(href => ({ href, type: 'image' })))
      lightbox.openAt(Math.max(0, images.indexOf(photo.getAttribute('href'))))
    })
  })
})()
