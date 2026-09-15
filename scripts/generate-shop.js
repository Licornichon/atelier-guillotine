const fs = require('fs')
const path = require('path')

// Scans assets/media/shop/<slug>/ : each sub-folder is one item for sale.
// Each folder must contain an info.json plus one or more images.
// Output: src/data/shop.json (consumed by loaders/pug-with-data.js).

const SHOP_DIR = path.join(__dirname, '../assets/media/shop')
const OUTPUT_FILE = path.join(__dirname, '../src/data/shop.json')

const VALID_STATUS = ['available', 'reserved']
const VALID_LEVEL = ['battle-ready', 'tabletop-plus', 'display']
const LANGS = ['fr', 'en']
const IMG_RE = /\.(jpg|jpeg|png|webp|gif)$/i

const dataDir = path.dirname(OUTPUT_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Translatable fields: read the `fr` / `en` block from info.json, falling back
// to the other language and then to the slug.
function localeBlock (info, lang, slug) {
  const src = info[lang] || info.fr || info.en || {}
  return {
    name: src.name || slug,
    tag: src.tag || '',
    description: src.description || '',
  }
}

const items = []

if (fs.existsSync(SHOP_DIR)) {
  const slugs = fs.readdirSync(SHOP_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)

  slugs.forEach(slug => {
    const dir = path.join(SHOP_DIR, slug)
    const infoPath = path.join(dir, 'info.json')

    if (!fs.existsSync(infoPath)) {
      console.warn(`⚠️  shop/${slug} : info.json manquant, pièce ignorée`)
      return
    }

    let info
    try {
      info = JSON.parse(fs.readFileSync(infoPath, 'utf8'))
    } catch (err) {
      console.warn(`⚠️  shop/${slug}/info.json : JSON invalide (${err.message}), pièce ignorée`)
      return
    }

    const images = fs.readdirSync(dir)
      .filter(file => IMG_RE.test(file))
      .sort()
      .map(file => `./assets/media/shop/${slug}/${file}`)

    if (images.length === 0) {
      console.warn(`⚠️  shop/${slug} : aucune image, pièce ignorée`)
      return
    }

    let status = String(info.status || 'available').toLowerCase()
    if (!VALID_STATUS.includes(status)) {
      console.warn(`⚠️  shop/${slug} : statut "${info.status}" invalide, "available" utilisé`)
      status = 'available'
    }

    let level = info.level ? String(info.level).toLowerCase() : ''
    if (level && !VALID_LEVEL.includes(level)) {
      console.warn(`⚠️  shop/${slug} : niveau "${info.level}" invalide (${VALID_LEVEL.join(', ')}), ignoré`)
      level = ''
    }

    if (!info.fr && !info.en) {
      console.warn(`⚠️  shop/${slug}/info.json : ni bloc "fr" ni bloc "en", libellés = slug`)
    }

    const i18n = {}
    LANGS.forEach(lang => { i18n[lang] = localeBlock(info, lang, slug) })

    items.push({
      slug,
      price: info.price || '',
      retailPrice: info.retailPrice || '',
      status,
      level,
      order: typeof info.order === 'number' ? info.order : null,
      images,
      i18n,
    })
  })
}

// Sort: manual "order" field first, then alphabetically by EN name
items.sort((a, b) => {
  const ao = a.order == null ? Infinity : a.order
  const bo = b.order == null ? Infinity : b.order
  if (ao !== bo) return ao - bo
  return a.i18n.en.name.localeCompare(b.i18n.en.name)
})

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2))
console.log(`✓ Shop généré : ${items.length} pièce(s) trouvée(s)`)
