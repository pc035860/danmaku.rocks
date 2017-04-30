const {
  FuseBox, BabelPlugin, PostCSS, CSSPlugin,
  SassPlugin, UglifyJSPlugin
} = require("fuse-box");

const POST_CSS_PLUGINS = [
  require('postcss-transform-shortcut'),
  require('autoprefixer')('last 2 versions')
];

const outputDir = 'docs';

// Create FuseBox Instance
const fuse = new FuseBox({
  homeDir: "app/",
  sourcemaps: true,
  outFile: `${outputDir}/bundle.js`,
  plugins: [
    [
      SassPlugin(),
      PostCSS(POST_CSS_PLUGINS),
      CSSPlugin({ minify: true })
    ],

    BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        sourceMaps: true,
        presets: ['es2015', 'stage-2']
      },
    }),
    UglifyJSPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  shim: {
    jquery: {
      exports: '$'
    }
  },
  alias: {
    _Danmaku: '~/modules/Danmaku/src/index.js'
  }
});

fuse.bundle(">index.js");
