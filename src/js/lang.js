const dicts = {
  fr: require('./translations.fr'),
  en: require('./translations.en'),
}

// The page language is set at build time: French at the root, English under
// /en/ (webpack.config.js), written in <html lang>
const currentLang = document.documentElement.lang === 'en' ? 'en' : 'fr'

// Strings written by the JS itself (form.js)
function t (key) {
  return dicts[currentLang][key] || key
}

module.exports = { t }
