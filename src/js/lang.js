const dicts = {
  fr: require('./translations.fr'),
  en: require('./translations.en'),
}

const STORAGE_KEY = 'fc-lang'
let currentLang = 'fr'

// Per-item shop translations, injected by shop.pug
// (<script id="shop-i18n-data">). Shape: { slug: { fr: {...}, en: {...} } }
const shopI18n = (function () {
  const el = document.getElementById('shop-i18n-data')
  if (!el) return null
  try {
    return JSON.parse(el.textContent)
  } catch (e) {
    return null
  }
})()

function detectLang () {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') return stored
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

function t (key) {
  return (dicts[currentLang] && dicts[currentLang][key]) || key
}

// {name} placeholders: data-i18n-vars='{"name": "<key or value>"}'. A var holding
// a translation key is replaced by that key’s value (gallery alts), anything else
// is written as is (the price of a gallery caption). Same rule as t(key, vars) in
// the Pug templates, see loaders/pug-with-data.js
function interpolate (val, el, dict) {
  const raw = el.getAttribute('data-i18n-vars')
  if (!raw) return val
  let vars
  try {
    vars = JSON.parse(raw)
  } catch (e) {
    return val
  }
  return val.replace(/\{(\w+)\}/g, (m, name) => {
    if (dict[vars[name]] !== undefined) return dict[vars[name]]
    return name in vars ? vars[name] : m
  })
}

function applyTranslations (lang) {
  currentLang = lang
  const dict = dicts[lang]

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n')]
    if (val !== undefined) el.textContent = interpolate(val, el, dict)
  })

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-html')]
    if (val !== undefined) el.innerHTML = val
  })

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-placeholder')]
    if (val !== undefined) el.placeholder = val
  })

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-aria')]
    if (val !== undefined) el.setAttribute('aria-label', val)
  })

  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-alt')]
    if (val !== undefined) el.setAttribute('alt', interpolate(val, el, dict))
  })

  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-label')]
    if (val !== undefined) el.setAttribute('data-label', val)
  })

  // `content` attribute, used for <meta name="description">; <title> goes through [data-i18n]
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-content')]
    if (val !== undefined) el.setAttribute('content', val)
  })

  // Shop items: data-shop-i18n="<slug>.<field>" (text), data-shop-i18n-alt (alt attribute)
  if (shopI18n) {
    const shopValue = ref => {
      const dot = ref.lastIndexOf('.')
      const entry = shopI18n[ref.slice(0, dot)]
      return entry && entry[lang] && entry[lang][ref.slice(dot + 1)]
    }

    document.querySelectorAll('[data-shop-i18n]').forEach(el => {
      const val = shopValue(el.getAttribute('data-shop-i18n'))
      if (val != null) el.textContent = val
    })

    document.querySelectorAll('[data-shop-i18n-alt]').forEach(el => {
      const val = shopValue(el.getAttribute('data-shop-i18n-alt'))
      if (val != null) el.setAttribute('alt', val)
    })
  }

  document.documentElement.lang = lang

  document.querySelectorAll('.nav__lang-btn').forEach(btn => {
    const isActive = btn.dataset.lang === lang
    btn.classList.toggle('is-active', isActive)
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false')
  })
}

;(function () {
  currentLang = detectLang()
  applyTranslations(currentLang)

  document.querySelectorAll('.nav__lang-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, this.dataset.lang)
      applyTranslations(this.dataset.lang)
    })
  })
})()

module.exports = { t }
