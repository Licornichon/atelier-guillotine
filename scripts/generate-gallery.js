const fs = require('fs')
const path = require('path')
const { responsive, prune } = require('./images')

const MEDIA_DIR = path.join(__dirname, '../assets/media/gallery')
const OUTPUT_FILE = path.join(__dirname, '../src/data/gallery.json')

// Captions (optional): one info.json per folder holding photos gives the price
// shown with the level under an image, in the grid and in the lightbox.
//   { "20260914_220030.jpg": 50,     ← a bare number: the currency sign and
//     "20260914_220127.jpg": "" }      where it sits come from gallery.price,
//                                      which is worded per language
// The file lists every photo of its folder, so one left out shows up at a
// glance; a photo left blank simply gets no caption.
// Format doc: assets/media/gallery/README.md
const INFO_FILE = 'info.json'
const infoCache = new Map() // folder → { data, used: Set of file names seen }

// Create the data folder if it does not exist
const dataDir = path.dirname(OUTPUT_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Categories and display order
const categories = {
  'battle-ready': 'battle-ready',
  'tabletop-plus': 'tabletop-plus',
  'display': 'display',
}

// Publisher of an image = found from the first sub-folder under the level folder,
// whose name starts with one of these prefixes:
// gallery/tabletop-plus/w40k-custodes/… or gallery/display/mordheim/… → "gw".
// Images sitting directly in the level folder have no publisher.
const PUBLISHERS = {
  gw: [
    'gw', 'games-workshop',
    'w40k', '40k', 'warhammer-40k', 'kill-team', 'horus-heresy',
    'aos', 'age-of-sigmar', 'warcry', 'underworlds',
    'old-world', 'whfb', 'mordheim', 'necromunda', 'blood-bowl',
    'middle-earth', 'lotr',
  ],
}

// Display priority: these groups come first, in this order; every other image
// follows. Within a group, newest first. An image joins the first group it
// matches: publisher + level, and the game folder prefix when `games` is set.
const W40K = ['w40k', '40k', 'warhammer-40k']
const PRIORITY = [
  { publisher: 'gw', level: 'tabletop-plus', games: W40K },
  { publisher: 'gw', level: 'tabletop-plus' },
  { publisher: 'gw', level: 'battle-ready', games: W40K },
  { publisher: 'gw', level: 'battle-ready' },
  { publisher: 'gw', level: 'display', games: W40K },
  { publisher: 'gw', level: 'display' },
]

async function main () {
  const items = []

  for (const [folder, level] of Object.entries(categories)) {
    const categoryPath = path.join(MEDIA_DIR, folder)

    if (!fs.existsSync(categoryPath)) {
      console.warn(`⚠️  Dossier ${folder} introuvable`)
      continue
    }

    // Walk the folder recursively so per-project sub-folders are supported
    // (e.g. gallery/battle-ready/w40k-custodes/)
    for (const file of walkDir(categoryPath)) {
      if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) continue

      const filePath = path.join(categoryPath, file)
      const segments = file.split(path.sep)
      const price = priceOf(path.dirname(filePath), path.basename(file))
      const game = segments.length > 1 ? segments[0].toLowerCase() : ''
      const outRel = ['gallery', folder].concat(segments).join('/').replace(/\.[^./]+$/, '')

      items.push({
        // Resized WebP copies (scripts/images.js): src/srcset for the grid, full for the lightbox
        ...(await responsive(filePath, outRel)),
        level,
        game, // first sub-folder name, used for the alt text (gallery.game.<game>)
        publisher: publisherOf(game),
        ...(price !== null && { price }), // caption next to the level, see INFO_FILE
        mtime: fs.statSync(filePath).mtime.getTime(), // timestamp pour tri chronologique
        name: path.basename(file, path.extname(file)),
      })
    }
  }

  // Sort: PRIORITY group first (unmatched images last), then newest first
  items.sort((a, b) => rank(a) - rank(b) || b.mtime - a.mtime)

  warnUnusedInfo()
  prune('gallery')

  // Write the JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2))
  console.log(`✓ Galerie générée : ${items.length} image(s) trouvée(s)`)
}

function rank (item) {
  const i = PRIORITY.findIndex(p =>
    p.level === item.level &&
    p.publisher === item.publisher &&
    (!p.games || p.games.some(prefix => item.game.startsWith(prefix)))
  )
  return i === -1 ? PRIORITY.length : i
}

// Price shown under one photo, as a number; null when it has no caption
function priceOf (dir, fileName) {
  if (!infoCache.has(dir)) {
    const file = path.join(dir, INFO_FILE)
    let data = {}
    if (fs.existsSync(file)) {
      try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'))
      } catch (err) {
        console.warn(`⚠️  ${path.relative(MEDIA_DIR, file)} ignoré, JSON invalide : ${err.message}`)
      }
    }
    infoCache.set(dir, { data, used: new Set() })
  }

  const info = infoCache.get(dir)
  info.used.add(fileName)

  const raw = info.data[fileName]
  if (raw == null || String(raw).trim() === '') return null

  const price = Number(raw)
  if (!Number.isFinite(price) || price <= 0) {
    const where = path.relative(MEDIA_DIR, path.join(dir, INFO_FILE))
    console.warn(`⚠️  ${where} : "${fileName}" attend un nombre, reçu ${JSON.stringify(raw)}`)
    return null
  }
  return price
}

// An info.json key matching no photo is a typo or a renamed file: say so
function warnUnusedInfo () {
  infoCache.forEach((info, dir) => {
    Object.keys(info.data).forEach(key => {
      if (info.used.has(key)) return
      const where = path.relative(MEDIA_DIR, path.join(dir, INFO_FILE))
      console.warn(`⚠️  ${where} : aucune photo nommée "${key}"`)
    })
  })
}

function publisherOf (folder) {
  if (!folder) return ''
  const match = Object.entries(PUBLISHERS)
    .find(([, prefixes]) => prefixes.some(prefix => folder.startsWith(prefix)))
  return match ? match[0] : ''
}

// Helper: walk recursively, returning paths relative to root
function walkDir (dir, root) {
  if (!root) root = dir
  let files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath, root))
    } else {
      files.push(path.relative(root, fullPath))
    }
  })

  return files
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
