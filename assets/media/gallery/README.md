# Photos de la galerie (page d’accueil)

Un dossier par niveau, et autant de sous-dossiers que voulu à l’intérieur :

```text
assets/media/gallery/
  battle-ready/
    w40k/                 ← sous-dossier optionnel (un projet, un jeu…)
      info.json           ← les légendes des photos de ce dossier
      20260914_221548.jpg
  tabletop-plus/
    infinity/
      info.json
      20260914_220030.jpg
  display/                ← photos posées à la racine du niveau :
    info.json             ← le fichier est ici
    20260914_215320.jpg
```

Le nom du sous-dossier sert à deux choses : le texte alternatif de la photo
(clé `gallery.game.<sous-dossier>` dans `src/js/translations.*.js`) et l’ordre
d’affichage (liste `PRIORITY` dans `scripts/generate-gallery.js`).

## `info.json` : les légendes

Une légende est un petit cadre affichant **le niveau et le prix par figurine**.
Elle apparaît au survol de la vignette sur ordinateur, et sous la photo une fois
celle-ci ouverte en plein écran. Le niveau vient du dossier, le prix de ce fichier.

Chaque dossier contenant des photos a son `info.json`, qui les liste toutes :

```json
{
  "20260914_220627.jpg": 34,
  "20260914_220731.jpg": ""
}
```

La clé est le nom du fichier, extension comprise. La valeur est un **nombre nu,
sans unité** : le signe € et sa place dans la phrase dépendent de la langue
affichée et vivent dans la clé `gallery.price` de `src/js/translations.fr.js` et
de `translations.en.js` ("34 € par figurine" en français, "€34 per miniature" en
anglais).

Une photo laissée vide n’a pas de légende. Une photo ajoutée au dossier doit être
ajoutée à la liste à la main ; une clé qui ne correspond à aucune photo (faute de
frappe, fichier renommé), comme une valeur qui n’est pas un nombre, est signalée
dans la console de `npm run generate`.

Un `info.json` ne vaut que pour les photos posées **à côté de lui** : chaque
sous-dossier de jeu a le sien, et un dossier de niveau qui porte des photos
directement à sa racine (comme `display/`) a le sien aussi.

## Pipeline

Les photos et les `info.json` sont la seule source à éditer.
`scripts/generate-gallery.js` en dérive `src/data/gallery.json` et des copies WebP
redimensionnées dans `assets/generated/gallery/` (vignette de la grille, version
plein écran) ; ce sont des artefacts de build gitignorés. Les photos originales ne
sont pas publiées.

`npm run generate` tourne avant `dev` / `build` / `build:prod`. En session
`npm run dev` déjà lancée, webpack ne surveille ni les photos ni les `info.json` :
relance `npm run generate` (ou le serveur) après modification.
