const fs = require('fs')
const path = require('path')

// Injects build-time data into the Pug templates as local variables, re-read on
// every compilation: generated data (gallery + shop) and the translations behind
// `t(key)`. Each page is built once per language (webpack.config.js): the
// language comes from the template query, `index.pug?lang=en`, French by default.

const DATA_DIR = path.join(__dirname, '../src/data')
const SOURCES = {
  galleryItems: path.join(DATA_DIR, 'gallery.json'),
  shopItems: path.join(DATA_DIR, 'shop.json'),
}
const TRANSLATIONS = {
  fr: path.join(__dirname, '../src/js/translations.fr.js'),
  en: path.join(__dirname, '../src/js/translations.en.js'),
}

// Canonical site URL (no trailing slash), used by the canonical and Open Graph
// tags. ⚠️ Keep in sync with src/static/robots.txt and src/static/sitemap.xml
// if the domain ever changes.
const SITE_URL = 'https://www.atelierguillotine.com'

module.exports = function (source) {
  const lang = new URLSearchParams(this.resourceQuery).get('lang') === 'en' ? 'en' : 'fr'

  let prelude = `- var siteUrl = ${JSON.stringify(SITE_URL)}\n`
  prelude += `- var lang = ${JSON.stringify(lang)}\n`
  // Root-relative URL of a page in a language: French at the root, English under /en/
  prelude += `- var pageUrl = function (page, l) { return (l === 'en' ? '/en' : '') + (page === 'home' ? '/' : '/' + page) }\n`

  Object.entries(SOURCES).forEach(([varName, file]) => {
    let data = []
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, 'utf8'))
    }
    // Register as a dependency so a JSON change triggers a rebuild
    this.addDependency(file)
    prelude += `- var ${varName} = ${JSON.stringify(data)}\n`
  })

  // Fresh read on each compilation (require caches), rebuild when edited
  const dictFile = TRANSLATIONS[lang]
  delete require.cache[require.resolve(dictFile)]
  this.addDependency(dictFile)
  prelude += `- var i18n = ${JSON.stringify(require(dictFile))}\n`
  // t(key[, vars]): each {name} placeholder is replaced by the value of the key
  // vars[name], or by vars[name] itself when it is not a key
  prelude += `- var t = function (key, vars) { var val = key in i18n ? i18n[key] : key; return !vars ? val : String(val).replace(/\\{(\\w+)\\}/g, function (m, name) { return vars[name] in i18n ? i18n[vars[name]] : (name in vars ? vars[name] : m) }) }\n`

  return prelude + source
}
