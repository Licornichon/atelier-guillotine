const fs = require('fs')
const path = require('path')

// Injects build-time data into the Pug templates as local variables, re-read on
// every compilation: generated data (gallery + shop) and the French translations
// behind `t(key)`, which provides the static HTML text (<html lang="fr">);
// lang.js swaps it at runtime.

const DATA_DIR = path.join(__dirname, '../src/data')
const SOURCES = {
  galleryItems: path.join(DATA_DIR, 'gallery.json'),
  shopItems: path.join(DATA_DIR, 'shop.json'),
}
const TRANSLATIONS_FR = path.join(__dirname, '../src/js/translations.fr.js')

// Canonical site URL (no trailing slash), used by the canonical and Open Graph
// tags. ⚠️ Keep in sync with src/static/robots.txt and src/static/sitemap.xml
// if the domain ever changes.
const SITE_URL = 'https://www.atelierguillotine.com'

module.exports = function (source) {
  let prelude = `- var siteUrl = ${JSON.stringify(SITE_URL)}\n`

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
  delete require.cache[require.resolve(TRANSLATIONS_FR)]
  this.addDependency(TRANSLATIONS_FR)
  prelude += `- var i18nFr = ${JSON.stringify(require(TRANSLATIONS_FR))}\n`
  prelude += `- var t = function (key) { return key in i18nFr ? i18nFr[key] : key }\n`

  return prelude + source
}
