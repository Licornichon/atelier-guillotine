// Shop cards — clicking a thumbnail shows that photo in the card's main slot.
// The main photo's href follows, so the full-screen gallery (lightbox.js)
// opens on the photo being shown.
;(function () {
  document.querySelectorAll('.shop__item').forEach(item => {
    const photo = item.querySelector('.shop__photo')
    const img = photo && photo.querySelector('img')
    const thumbs = item.querySelectorAll('.shop__thumb')
    if (!img || !thumbs.length) return

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-src')
        photo.setAttribute('href', src)
        img.setAttribute('src', src)

        thumbs.forEach(t => {
          const isActive = t === thumb
          t.classList.toggle('is-active', isActive)
          t.setAttribute('aria-pressed', isActive ? 'true' : 'false')
        })
      })
    })
  })
})()
