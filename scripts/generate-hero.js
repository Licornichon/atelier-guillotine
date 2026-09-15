const fs = require('fs')
const path = require('path')
const { variant, prune } = require('./images')

// Hero side images: assets/media/hero/<name>.png → assets/generated/hero/<name>.webp
// (resized, transparency kept). Pages reference ./assets/generated/hero/<name>.webp.

const HERO_DIR = path.join(__dirname, '../assets/media/hero')
const IMG_RE = /\.(png|jpe?g|webp)$/i

async function main () {
  const files = fs.existsSync(HERO_DIR)
    ? fs.readdirSync(HERO_DIR).filter(file => IMG_RE.test(file))
    : []

  for (const file of files) {
    await variant(path.join(HERO_DIR, file), 'hero/' + path.parse(file).name, 'hero')
  }

  prune('hero')
  console.log(`✓ Hero généré : ${files.length} image(s)`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
