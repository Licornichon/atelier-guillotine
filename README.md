# Atelier Guillotine — licornichon.github.io

Site portfolio mono-page pour **Atelier Guillotine**, peinture de figurines sur commande. Portfolio professionnel avec galerie dynamique, tarifs et formulaire de contact.

## Développement local

```bash
npm install
npm run dev        # dev server avec hot reload → http://localhost:8080
```

## Build

```bash
npm run build:prod  # build de production → dist/
```

Les fichiers buildés ne sont pas committés. Le déploiement se fait automatiquement via **GitHub Actions** à chaque push sur `master`.

## Stack

- **Webpack 5**, Pug 3, Dart Sass, Babel
- **Masonry.js** (layout galerie), **GLightbox** (lightbox), **imagesLoaded** (sync images)
- **Web3Forms** (formulaire de contact sans backend)
- **Traductions bilingues** (FR/EN avec détection auto par navigateur)

## Architecture

### Structure source
```
src/
  js/
    main.js          → Entry point webpack
    lang.js          → Système de traductions
    gallery.js       → Masonry + filtres + imagesLoaded
    lightbox.js      → GLightbox pour preview galerie
    form.js          → Web3Forms AJAX + validation
    anchors.js       → Smooth scroll + toggle menu mobile
    translations.js  → Dictionnaire FR/EN complet
  scss/
    main.scss        → Import tous les partials
    _variables.scss  → Couleurs, typo, breakpoints
    _nav.scss, _hero.scss, _about.scss, etc.
    _faq.scss
  images/
    favicon.ico, favicon-32x32.png, favicon-16x16.png
  assets/
    media/
      hero.png       → Image section hero
      tournament-ready/  → Images galerie niveau 1
      tabletop/          → Images galerie niveau 2
      tabletop-plus/     → Images galerie niveau 3
  index.pug          → Template HTML principal
```

### Fichiers auto-générés
```
scripts/generate-gallery.js    → Scanne assets/media/ et génère src/data/gallery.json
loaders/pug-with-gallery.js    → Loader webpack qui injecte galleryItems dans pug
.github/workflows/deploy.yml   → Build + deploy auto sur push master
```

### Fichiers ignorés
```
dist/                          → Build final (généré)
node_modules/
assets/                        → Copie du dist/ (GitHub Pages)
index.html, bundle.js          → Générés au build
src/data/gallery.json          → Généré au build
```

## Fonctionnalités

### 🌍 Traductions (i18n)
- **Détection auto** : Français si navigateur configured en `fr-*`, sinon Anglais
- **Toggle FR/EN** : Petit bouton dans la nav, stocké en `localStorage`
- **Toutes les chaînes traduites** : Nav, sections, formulaire, FAQ, etc.
- **Mise à jour facile** : Modifier `translations.js` et relancer le build

### 🖼️ Galerie dynamique
- **Scanne `assets/media/{tournament-ready,tabletop,tabletop-plus}/`** au build
- **Génère automatiquement** `gallery.json` trié par date de modification (récent en premier)
- **Filtrage par niveau** avec Masonry layout
- **Lightbox GLightbox** pour preview full-size
- **Lazy-loading** des images (data-* optimisé)
- **Pour ajouter images** : Déposer dans un des 3 dossiers, puis `npm run build`

### 📧 Formulaire de contact
- **Web3Forms** : Pas de backend, envoie les mails directement
- **Anti-spam** : Honeypot (champ invisible) + validation JS
- **Messages traduits** : "Envoi en cours", "Message envoyé", etc.
- **Access key** : Dans `src/index.pug` (non sensible, public côté client)

### 🎨 Design
- **BEM CSS** pour toute la structure
- **Variables Sass** : couleurs, typo, breakpoints
- **Font auto-hébergée** : `UnifrakturMaguntia` (pas de CDN Google)
- **Responsive** : Mobile, tablet, desktop

## SEO

**Métadonnées optimisées** :
- Title : "Atelier Guillotine - Peinture de Figurines Professionnelle | Toutes Marques"
- Description : 160 chars avec keywords (professionnel, 15 ans, récompenses, toutes marques)
- Favicon : 3 formats pour compatibilité

**Trust factors** :
- Section "Pourquoi choisir Atelier Guillotine" avec 4 points forts
- FAQ 6 questions (pour long-tail keywords)

## Commandes npm

```bash
npm run predev              # Génère gallery.json avant dev
npm run dev                 # Dev server hot-reload
npm run build              # Dev build (output dist/)
npm run build:prod         # Prod build minifiée (output dist/)
npm run watch              # Watch mode sans serveur
```

## Déploiement

**GitHub Pages** (automatique via Actions) :
1. Push sur `master`
2. GitHub Actions lance `npm run build:prod`
3. Déploie `dist/` sur GitHub Pages (~1-2 min)

Pour configurer :
- Settings → Pages → Source → **GitHub Actions** ✅
- Webhook automatique activé

## Todo

- [x] ✅ Traductions FR/EN complètes avec détection auto
- [x] ✅ Système de galerie dynamique
- [x] ✅ Optimisation SEO (métadonnées, trust factors)
- [x] ✅ Favicons
- [x] ✅ Lightbox galerie
- [x] ✅ Formulaire Web3Forms
- [ ] Ajouter photo "à propos" (remplacer placeholder)
- [ ] Ajouter imagesLoaded au chargement initial ✅ **DONE**
- [ ] Déployer sur GitHub Pages (configuration initiale)
- [ ] Témoignages clients (si disponibles pour boost SEO)

## Notes importantes

- **hero.png** : À la racine de `assets/media/`, non dans la galerie
- **Autres images** : Dossiers `tournament-ready/`, `tabletop/`, `tabletop-plus/` uniquement pour la galerie
- **Lazy-loading** : Activé sur images galerie, se charge au scroll (normal)
- **Web3Forms** : Access key visible dans le source (normal, elle accepte requêtes POST de n'importe quel domaine)
- **Fonts** : UnifrakturMaguntia auto-hébergée (~22KB woff2, zéro requête externe)

## Changelog

**v2.0 - Rebuild complet**
- Webpack 3 → Webpack 5 ✅
- Pug 2 → Pug 3 ✅
- Ancien contenu → Portfolio Atelier Guillotine ✅
- Ajout traductions i18n ✅
- Ajout galerie dynamique ✅
- Ajout SEO optimisé ✅
- GitHub Pages + CI/CD ✅
