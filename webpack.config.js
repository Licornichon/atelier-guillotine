const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const os = require('os')

const src = path.join(__dirname, 'src')

// Pages built by HtmlWebpackPlugin (src/<page>.pug), and the output folder of
// each language
const PAGES = ['index', 'commissions', 'courses', 'shop', 'legal']
const LANGS = { fr: '', en: 'en/' }

// CSS: separate bundle.css in production (styled first paint, stable anchor
// jumps); injected by style-loader in dev (instant hot reload of styles)
const isProd = process.argv.includes('--mode=production') // npm run build:prod
const cssLoader = isProd ? MiniCssExtractPlugin.loader : 'style-loader'

module.exports = {
  entry: {
    bundle: path.join(src, 'js/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  devServer: {
    static: path.resolve(__dirname, './src/'),
    host: '0.0.0.0',
    port: 8080,
    hot: true,
    open: true,
    // Parité avec le .htaccess de prod : /shop sert shop.html en local aussi.
    historyApiFallback: {
      rewrites: [
        { from: /^\/en\/?$/, to: '/en/index.html' },
        { from: /^\/(.+?)\/?$/, to: (ctx) => '/' + ctx.match[1] + '.html' },
      ],
    },
    onListening: (devServer) => {
      const port = devServer.server.address().port
      console.log('\n  ➜  Local:   http://localhost:' + port + '/')

      const interfaces = os.networkInterfaces()
      Object.keys(interfaces).forEach(name => {
        interfaces[name].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            console.log(`  ➜  Network: http://${iface.address}:${port}/`)
          }
        })
      })
      console.log('')
    },
  },
  stats: {
    colors: true,
    hash: true,
    timings: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: '@webdiscus/pug-loader',
            options: { pretty: true },
          },
          {
            loader: path.resolve(__dirname, 'loaders/pug-with-data.js'),
          },
        ],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [cssLoader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: [cssLoader, 'css-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|webp)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/media/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    // Production only: bundle.css, linked in <head> by HtmlWebpackPlugin
    ...(isProd ? [new MiniCssExtractPlugin({ filename: '[name].css' })] : []),
    new CopyWebpackPlugin({
      patterns: [
        // Photo originals (gallery/, shop/, hero/) stay out of dist/: pages only use
        // the resized WebP copies written to assets/generated/ by npm run generate
        {
          from: path.join(__dirname, 'assets/media'),
          to: 'assets/media',
          noErrorOnMissing: true,
          globOptions: { ignore: ['**/gallery/**', '**/shop/**', '**/hero/**'] },
        },
        { from: path.join(__dirname, 'assets/generated'), to: 'assets/generated', noErrorOnMissing: true },
        // robots.txt + sitemap.xml → dist/ root
        { from: path.join(src, 'static'), to: '.', noErrorOnMissing: true },
      ],
    }),
    // Every page twice: French at the root (shop.html → /shop), English under
    // en/ (en/shop.html → /en/shop). Same template, the language travels in the
    // query and loaders/pug-with-data.js picks the matching translations.
    ...PAGES.flatMap(page => Object.entries(LANGS).map(([lang, dir]) => new HtmlWebpackPlugin({
      template: path.join(src, page + '.pug') + '?lang=' + lang,
      filename: dir + page + '.html',
    }))),
  ],
}
