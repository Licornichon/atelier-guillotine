const GLightbox = require('glightbox')
require('glightbox/dist/css/glightbox.min.css')

// Android back button: while the lightbox is open, a history entry stands in
// for it, so "back" closes the photo and puts the page back as it was instead
// of leaving it (which used to unload the page and leave an empty grey screen).
function closeOnBack (lightbox) {
  let entryPushed = false

  lightbox.on('open', () => {
    if (entryPushed) return
    history.pushState({ glightbox: true }, '')
    entryPushed = true
  })

  // Closed from the lightbox itself (X, escape, click outside): drop that entry,
  // so the back button goes back to the previous page and not to a dead press.
  lightbox.on('close', () => {
    if (!entryPushed) return
    entryPushed = false
    history.back()
  })

  window.addEventListener('popstate', () => {
    if (!entryPushed) return
    entryPushed = false // before close(), so its 'close' handler leaves history alone
    lightbox.close()
  })
}

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
    moreLength: 0, // no "see more" link: it would cut the caption markup in half
  })

  closeOnBack(lightbox)

  items.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault()
      const href = item.getAttribute('href')
      if (!href || href === '#') return

      const visible = Array.from(document.querySelectorAll('.gallery__item:not(.is-hidden)'))
        .filter(el => el.getAttribute('href') && el.getAttribute('href') !== '#')
      const elements = visible.map(el => {
        // The grid caption is reused as is, so it follows the FR/EN switch;
        // GLightbox drops the whole panel when both strings are empty
        const caption = el.querySelector('.gallery__caption')
        return {
          href: el.getAttribute('href'),
          type: 'image',
          title: '',
          description: caption ? caption.outerHTML : '',
        }
      })
      const startAt = visible.indexOf(item)

      lightbox.setElements(elements)
      lightbox.openAt(startAt)
    })
  })
})()

// Shop: the card's main photo opens that piece's photos full screen
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

  closeOnBack(lightbox)

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
