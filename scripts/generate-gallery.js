const fs = require('fs')
const path = require('path')

const MEDIA_DIR = path.join(__dirname, '../assets/media/gallery')
const OUTPUT_FILE = path.join(__dirname, '../src/data/gallery.json')

// Create the data folder if it does not exist
const dataDir = path.dirname(OUTPUT_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const items = []

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

// Read files from each sub-folder
Object.entries(categories).forEach(([folder, level]) => {
  const categoryPath = path.join(MEDIA_DIR, folder)

  if (!fs.existsSync(categoryPath)) {
    console.warn(`⚠️  Dossier ${folder} introuvable`)
    return
  }

  // Walk the folder recursively so per-project sub-folders are supported
  // (e.g. gallery/battle-ready/w40k-custodes/)
  const files = walkDir(categoryPath)

  files.forEach(file => {
    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) return

    const filePath = path.join(categoryPath, file)
    const stat = fs.statSync(filePath)
    const relativePath = path.relative(path.join(__dirname, '..'), filePath)
    const segments = file.split(path.sep)
    const folder = segments.length > 1 ? segments[0].toLowerCase() : ''

    items.push({
      src: './' + relativePath.replace(/\\/g, '/'),
      level: level,
      game: folder, // first sub-folder name, used for the alt text (gallery.game.<game>)
      publisher: publisherOf(folder),
      mtime: stat.mtime.getTime(), // timestamp pour tri chronologique
      name: path.basename(file, path.extname(file)),
    })
  })
})

// Sort: PRIORITY group first (unmatched images last), then newest first
function rank (item) {
  const i = PRIORITY.findIndex(p =>
    p.level === item.level &&
    p.publisher === item.publisher &&
    (!p.games || p.games.some(prefix => item.game.startsWith(prefix)))
  )
  return i === -1 ? PRIORITY.length : i
}

function publisherOf (folder) {
  if (!folder) return ''
  const match = Object.entries(PUBLISHERS)
    .find(([, prefixes]) => prefixes.some(prefix => folder.startsWith(prefix)))
  return match ? match[0] : ''
}

items.sort((a, b) => rank(a) - rank(b) || b.mtime - a.mtime)

// Write the JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2))
console.log(`✓ Galerie générée : ${items.length} image(s) trouvée(s)`)

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
