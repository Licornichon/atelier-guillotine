// Intentionally empty.
//
// The coming-soon page is fully self-contained: its CSS is inlined in
// src/index.pug and it needs no JavaScript at all. Webpack still requires an
// entry point, so this file is it: it produces a near-empty bundle.js that
// HtmlWebpackPlugin does not inject (`inject: false`).
//
// The full site entry lives in src/js/main.js and is restored when the complete
// branch is merged back.
