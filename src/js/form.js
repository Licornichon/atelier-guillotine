const { t } = require('./lang')

;(function () {
  const form = document.querySelector('.contact__form')
  if (!form) return

  const submit = form.querySelector('.form__submit')
  const feedback = document.querySelector('.contact__feedback')

  form.addEventListener('submit', function (e) {
    e.preventDefault()

    const honeypot = form.querySelector('input[name="website"]')
    if (honeypot && honeypot.value) return

    submit.disabled = true
    submit.textContent = t('contact.sending')
    feedback.textContent = ''
    feedback.className = 'contact__feedback'

    const formData = new FormData(form)
    formData.delete('website')

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          feedback.textContent = t('contact.success')
          feedback.classList.add('contact__feedback--success')
          form.reset()
          submit.textContent = t('contact.sent')
        } else {
          throw new Error(data.message)
        }
      })
      .catch(() => {
        feedback.textContent = t('contact.error')
        feedback.classList.add('contact__feedback--error')
        submit.disabled = false
        submit.textContent = t('contact.submit')
      })
  })
})()
