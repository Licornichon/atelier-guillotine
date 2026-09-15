const fs = require('fs')
const path = require('path')

// Resized WebP copies of the site photos, shared by generate-{hero,gallery,shop}.js.
// Written under assets/generated/ (gitignored, copied to dist/ by webpack); the
// originals in assets/media/ are never modified nor published.
// A copy is only re-encoded when its source is newer, and copies whose source is
// gone are deleted (prune). sharp also applies the EXIF orientation and drops the
// photo metadata (GPS position included).
// Changed a preset? Delete assets/generated/ to re-encode everything.

let sharp
try {
  sharp = require('sharp')
} catch (err) {
  console.error('✗ sharp manquant : lance "npm install" (utilisé par npm run generate)')
  process.exit(1)
}

const ROOT = path.join(__dirname, '..')
const GENERATED_DIR = path.join(ROOT, 'assets/generated')

// Longest side cap in px (never upscaled) + WebP settings
const PRESETS = {
  hero: { max: 1600, webp: { quality: 85, alphaQuality: 90 } }, // side cut-outs, hero is 75vh tall
  thumb: { max: 240, webp: { quality: 75 } }, // shop card thumbnails (76px)
  md: { max: 1000, webp: { quality: 80 } }, // gallery grid, shop card photo
  lg: { max: 2000, webp: { quality: 82 } }, // full-screen lightbox
}

const written = new Set()

// URL-safe name: "Copie de 20260914_221548" → "copie-de-20260914_221548"
function slug (name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

// Encodes `src` (absolute path) with a preset. `outRel` = path under
// assets/generated/, without extension. Returns { src: public URL, width, height }.
async function variant (src, outRel, presetName) {
  const preset = PRESETS[presetName]
  const rel = outRel.split('/').map(slug).join('/') + '.webp'
  const out = path.join(GENERATED_DIR, rel)
  written.add(path.normalize(out))

  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(src).mtimeMs) {
    fs.mkdirSync(path.dirname(out), { recursive: true })
    await sharp(src)
      .rotate()
      .resize({ width: preset.max, height: preset.max, fit: 'inside', withoutEnlargement: true })
      .webp(preset.webp)
      .toFile(out)
  }

  const { width, height } = await sharp(out).metadata()
  return { src: './assets/generated/' + rel, width, height }
}

// Photo shown in a grid / card (md, with lg in srcset for high-density screens)
// + full-screen version (lg), optionally a small thumbnail
async function responsive (src, outRel, { thumb = false } = {}) {
  const md = await variant(src, outRel + '-md', 'md')
  const lg = await variant(src, outRel + '-lg', 'lg')
  const image = {
    src: md.src,
    srcset: lg.width > md.width ? `${md.src} ${md.width}w, ${lg.src} ${lg.width}w` : `${md.src} ${md.width}w`,
    width: md.width,
    height: md.height,
    full: lg.src,
  }
  if (thumb) image.thumb = (await variant(src, outRel + '-thumb', 'thumb')).src
  return image
}

// Deletes the files under assets/generated/<subdir>/ that this run did not write
function prune (subdir) {
  const dir = path.join(GENERATED_DIR, subdir)
  if (!fs.existsSync(dir)) return

  ;(function walk (current) {
    fs.readdirSync(current, { withFileTypes: true }).forEach(entry => {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        if (fs.readdirSync(full).length === 0) fs.rmdirSync(full)
      } else if (!written.has(path.normalize(full))) {
        fs.unlinkSync(full)
      }
    })
  })(dir)
}

module.exports = { variant, responsive, prune }
