# CLAUDE.md

## Working rules (override defaults)

- **Never run `git`**: not `commit`/`push`, not `add`/`rm`/`restore`/`checkout`/`stash`/`reset`, not even `status`/`diff`/`log`. User does all git manually. Edit files directly, describe changes in prose. If a git command is needed (e.g. untrack a newly-ignored file), give it to the user to run.
- **Never run builds**: no `npm run build`/`build:prod`/`dev`/`watch`/`webpack`. User keeps `npm run dev` (watch) running and sees compile errors there. Verify by static reasoning. Config changes (`webpack.config.js`, loaders, new `HtmlWebpackPlugin`) need a user restart; say so, don't do it.
- Generated data (`src/data/gallery.json`, `src/data/shop.json`, resized photos in `assets/generated/`) is **gitignored**; edit the sources (image folders under `assets/media/`, `assets/media/shop/*/info.json`), not the JSON. `npm run dev` doesn't re-run the generators.

## Project

SPA portfolio for **Atelier Guillotine**, miniature-painting commission service (Warhammer, Infinity…). Dark theme.
Repo is named `licornichon.github.io`; `master` = old unrelated personal site; **live site is the `feat/fools-cauldron` branch** (v2.0 rebuild). Prod domain `atelierguillotine.com`, registered and pointed at the OVH hosting from the OVH panel (see Deployment).

## Commands

```bash
npm run dev          # webpack-dev-server, localhost:8080, binds 0.0.0.0
npm run watch        # webpack --watch, no server
npm run build        # dev build → dist/
npm run build:prod   # minified prod build → dist/
```

`pre{dev,build,build:prod}` run `npm run generate` = `scripts/generate-hero.js` + `scripts/generate-gallery.js` (→ `src/data/gallery.json`) + `scripts/generate-shop.js` (→ `src/data/shop.json`). All three write resized WebP copies of the photos to `assets/generated/` through `scripts/images.js` (sharp, cached by mtime, pruned); templates only reference those, and `CopyWebpackPlugin` leaves the originals (`assets/media/{gallery,shop,hero}/`) out of `dist/`. No tests.

## Architecture

- Entry `src/js/main.js` → `bundle.js` (injected into every page).
- `HtmlWebpackPlugin` builds 2 pages: `index.html`←`src/index.pug`, `shop.html`←`src/shop.pug`. **`legal.html` is temporarily disabled**: its plugin is commented out in `webpack.config.js`, along with the footer links (`index.pug`, `shop.pug`) and the GDPR notice (`includes/_contact.pug`). `src/legal.pug` is kept. Re-enable all four together; it is a legal requirement before the site goes public.
- SCSS is `require`d from `main.js`. `build:prod` extracts it into `bundle.css` linked in `<head>` (`mini-css-extract-plugin`: styled first paint, stable anchor jumps from another page); dev and `build` inject it with `style-loader`, so page jumps on load are still visible there.
- Markup shared by `index.pug` + `shop.pug` lives in `src/includes/` (`_contact.pug`, `_about.pug`, `_faq.pug`). Nav and hero are mixins (`_nav.pug` → `+nav(page)`, `_hero.pug` → `+hero({…})`); nav links are listed once inside the mixin.
- `dist/` not committed. `.gitignore`: `dist/`, `index.html`, `bundle.js`, `index.js`, `src/data/gallery.json`, `src/data/shop.json`.

**JS modules** (`src/js/`, each an IIFE, CommonJS `require`, Babel):

| file | role |
|---|---|
| `lang.js` | i18n FR/EN, exports `t(key)` |
| `anchors.js` | smooth scroll on nav links (`scrollIntoView`, nav offset = `section[id] { scroll-margin-top }`) + mobile menu (`.nav__menu.is-open`: links + FR/EN switch) |
| `gallery.js` | level filter + Masonry; `imagesLoaded` → `msnry.layout()` |
| `lightbox.js` | GLightbox: homepage gallery items, + shop card main photo (`data-shop-images`) |
| `shop.js` | shop card thumbnails swap the main photo (and its href) |
| `faq.js` | mobile FAQ accordion (`.faq__item.is-open`, answers hidden by CSS below `$bp-md`) |
| `form.js` | Web3Forms AJAX submit |

**SCSS** (`src/scss/`): `main.scss` `@use`s partials; vars/mixins in `_variables.scss`; every partial starts `@use 'variables' as *`.

## Stack

Webpack 5 (`webpack.config.js`, asset modules for img/fonts) · Pug 3 + `@webdiscus/pug-loader` · Dart Sass (`@use`/`@forward` only) · PostCSS (`postcss-preset-env`, `cssnano`) · Babel `preset-env` (`browserslist`) · Masonry · GLightbox · imagesLoaded · Web3Forms.

## Typography

No CDN fonts: self-hosted in `_fonts.scss` (`src/fonts/`).
`Crusades` = brand name only via `.brand-name` (`$font-brand`). `UnifrakturMaguntia` declared, unused. Everything else `system-ui` (`$font-sans`).

## Pages & sections

Homepage (`index.pug`) order: hero → gallery → services → pricing → **FAQ / contact / about** (`include`d) → footer.

| section | id | scss |
|---|---|---|
| nav | none | `_nav.scss` |
| hero | `#hero` | `_hero.scss` |
| gallery | `#gallery` | `_gallery.scss` |
| services (Battle Ready / Tabletop+ / Display) | `#services` | `_services.scss` |
| pricing | `#pricing` | `_pricing.scss` |
| FAQ | `#faq` | `_faq.scss` |
| contact | `#contact` | `_contact.scss` |
| about | `#about` | `_about.scss` |
| footer | none | `_footer.scss` |
| shop page | `#shop` | `_shop.scss` |
| legal page | none | `_legal.scss` |

## Shop page

`shop.pug` → `shop.html`, nav label "Boutique" (FR) / "Shop" (EN). Hero, for-sale list, then the shared contact/about/FAQ includes.

- One folder per piece: `assets/media/shop/<slug>/` = `info.json` + image files (sorted by name, first = cover).
- `info.json`: shared `price`, optional `retailPrice` (unpainted models, shown small under the price), `status` (`available`\|`reserved`), `level` (`battle-ready`\|`tabletop-plus`\|`display`), optional `order`; plus `fr` / `en` blocks each holding `name`, `tag`, `description` (one block is reused if the other is missing). `level` + `tag` render as card badges.
- `info.json` is the only file to hand-edit; `generate-shop.js` derives `src/data/shop.json` (adds `slug`, `images[]`, groups translations under `i18n`). Webpack doesn't watch `info.json` → user re-runs `npm run generate` after edits.
- Card text renders in FR by default; `shop.pug` emits `<script id="shop-i18n-data">` (map `{slug: {fr,en}}`) and `lang.js` switches `[data-shop-i18n="<slug>.<field>"]` elements FR/EN from it.
- Remove a piece by deleting its folder (no "sold" status). Thumbnails swap the card's main photo (`shop.js`); the main photo opens the piece's full-screen gallery at the photo shown (`lightbox.js`). Format doc: `assets/media/shop/README.md`.

## Gallery

Levels `battle-ready` / `tabletop-plus` / `display`. `.gallery__item[data-level]`; filter buttons `[data-filter]` = `all` + 3 levels; filtering toggles `.is-hidden` then `imagesLoaded` → `msnry.layout()`. Columns via `.gallery__sizer` + `.gallery__item` width (20% above `$bp-xl`, 25%, 33% below `$bp-lg`, 50% below `$bp-sm`).

`generate-gallery.js` scans `assets/media/gallery/{battle-ready,tabletop-plus,display}/` (repo root, not `src/`, sub-folders ok; the first sub-folder's name prefix gives the publisher via `PUBLISHERS`, e.g. `w40k-…`/`aos-…`/`mordheim` → `gw`), sorts by its `PRIORITY` list of publisher + level (+ optional game prefix, w40k first) groups, then mtime desc → `gallery.json`. `loaders/pug-with-data.js` prepends `- var galleryItems` + `- var shopItems` to every Pug and marks both JSON as deps. `CopyWebpackPlugin` copies `assets/media/` (minus the photo originals) and `assets/generated/` → `dist/`.

## i18n

`translations.fr.js` / `translations.en.js`, flat `key → string`. `lang.js` sets `<html lang>`; detects `navigator.language` (`fr*`→FR else EN), overridable via nav buttons, stored in `localStorage['fc-lang']`.

Templates never hardcode copy: static HTML text comes from `t(key)`, the French value injected by `loaders/pug-with-data.js` (which watches `translations.fr.js`); `lang.js` swaps it at runtime.

Per-page `<title>` uses `data-i18n`, `<meta name=description>` uses `data-i18n-content`; page-scoped keys `home.meta.*` / `shop.meta.*` / `legal.meta.title`. `<html data-page="home|shop|legal">` = hook.

`legal.html` is a **single page** carrying both the French *mentions légales* (LCEN) and the GDPR privacy information; the data part sits under the `#personal-data` anchor, which the contact-form notice links to. One footer link only. Its `legal.*` strings still contain UPPERCASE placeholders (`NOM_PRENOM`, `NUMEROSIRET`, `ADRESSE_POSTALE`, `EMAIL_CONTACT`, `MEDIATEUR_NOM`, `MEDIATEUR_SITE`, `JJ/MM/AAAA`); do not ship without replacing them.

Pug attributes: `data-i18n` (textContent, incl. `<title>`) · `data-i18n-html` (innerHTML) · `data-i18n-placeholder` · `data-i18n-aria` (aria-label) · `data-i18n-alt` (img alt; `{name}` placeholders filled from `data-i18n-vars='{"name":"<key>"}'`, `t(key, vars)` at build; used by gallery alts with `gallery.game.<sub-folder>`) · `data-i18n-label` (sets `data-label`, used by responsive pricing table) · `data-i18n-content` (content attr) · `data-shop-i18n="<slug>.<field>"` / `data-shop-i18n-alt` (shop-card text / img alt, resolved from the injected `shop-i18n-data` blob, not from `translations.*.js`).

## Contact form

`src/includes/_contact.pug` (shared). POSTs to `https://api.web3forms.com/submit`. Hidden fields: `access_key` (public), `subject` (default = commission wording; override with `- var contactSubject = "…"` before the `include`, as `shop.pug` does), `redirect=false`. `form.js` intercepts submit, drops honeypot `website` (`.form__honeypot`), `fetch` POST, translated status into `.contact__feedback` (`aria-live=polite`).

## Deployment

Canonical host is `https://www.atelierguillotine.com` (with `www`). The domain lives in **one place in code**: `SITE_URL` in `loaders/pug-with-data.js`, injected into every Pug template as `siteUrl` and used by the `canonical` and Open Graph tags. `src/static/{robots.txt,sitemap.xml}` (copied to `dist/` root by `CopyWebpackPlugin`) repeat it literally; update them too if the domain changes. Open Graph values are hardcoded in French because scrapers don't run the i18n JS; `legal.html` gets a canonical but no OG (it's `noindex` and excluded from the sitemap).

Hosted on **OVH shared hosting** (France), not GitHub Pages. `.github/workflows/deploy.yml` (the only workflow): every push → `npm ci` + `npm run build:prod` → upload `dist/` as an artifact; the `deploy` job runs only on `refs/heads/master` and pushes `dist/` to OVH over SFTP (`lftp mirror`, server dir `www/`; OVH shared hosting doesn't support FTPS). Secrets: `OVH_FTP_SERVER`, `OVH_FTP_USERNAME`, `OVH_FTP_PASSWORD`. The domain is configured in the OVH panel; there is no `CNAME` file.

## Conventions

Image-less sections fall back to `repeating-linear-gradient(-45deg, …)` diagonal stripes.
