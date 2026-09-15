# Pièces en vente (page Shop)

Un sous-dossier = une pièce affichée sur `shop.html`.

```text
assets/media/shop/
  <slug>/                ← nom du dossier = identifiant de la pièce (kebab-case)
    info.json            ← obligatoire (métadonnées + traductions FR/EN)
    01.jpg               ← 1+ images ; triées par nom, la 1re sert de photo principale
    02.jpg
    ...
```

## `info.json`

```json
{
  "price": "180 €",
  "retailPrice": "90 €",
  "status": "available",
  "level": "battle-ready",
  "order": 1,
  "fr": {
    "name": "Combat Patrol — Adeptus Custodes",
    "tag": "Warhammer 40 000 — Adeptus Custodes",
    "description": "Escouade complète, niveau Battle Ready, soclage simple à reproduire."
  },
  "en": {
    "name": "Combat Patrol — Adeptus Custodes",
    "tag": "Warhammer 40,000 — Adeptus Custodes",
    "description": "Complete patrol, Battle Ready level, basing kept simple to reproduce."
  }
}
```

**Champs partagés** (hors traduction) :

| Champ | Requis | Détail |
|---|---|---|
| `price` | non | Texte libre (`"180 €"`, `"sur devis"`…), identique FR/EN |
| `retailPrice` | non | Prix neuf des figurines seules, non peintes (texte libre). Affiché en petit sous `price` pour distinguer la valeur des figurines de celle de la peinture. |
| `status` | non (défaut : `available`) | `available` ou `reserved`. Retirer le dossier quand la pièce est vendue. |
| `level` | non | `battle-ready`, `tabletop-plus` ou `display`. Badge sur la carte. |
| `order` | non | Tri manuel croissant ; les pièces sans `order` passent après, triées par nom EN. |

**Blocs `fr` / `en`** — les champs traduits. Si un seul bloc est fourni, l'autre le réutilise ; un `name` manquant retombe sur le slug.

| Champ | Détail |
|---|---|
| `name` | Titre affiché |
| `tag` | Système / faction, en petit au-dessus du nom |
| `description` | Court paragraphe |

## Pipeline

`info.json` (+ les images) est **la seule source à éditer**. `scripts/generate-shop.js`
en dérive `src/data/shop.json` (ajoute `slug`, `images[]`, regroupe les blocs sous
`i18n`) ; c'est un artefact de build gitignoré.

La page rend le texte FR par défaut ; `src/js/lang.js` lit le `<script id="shop-i18n-data">`
injecté et bascule les éléments `[data-shop-i18n]` (texte) et `[data-shop-i18n-alt]` (alt de la photo)
FR/EN au changement de langue.

`npm run generate` (lancé avant `dev` / `build` / `build:prod`) régénère `shop.json`.
En session `npm run dev` déjà lancée, webpack ne surveille pas les `info.json` :
relance `npm run generate` (ou le serveur) après modification.
