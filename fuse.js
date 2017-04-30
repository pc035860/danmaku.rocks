const {
  FuseBox, BabelPlugin, PostCSS, CSSPlugin,
  SassPlugin, UglifyJSPlugin
} = require("fuse-box");

const POST_CSS_PLUGINS = [
  require('postcss-transform-shortcut'),
  require('autoprefixer')('last 2 versions')
];

const outputDir = 'public';

// Create FuseBox Instance
const fuse = new FuseBox({
  homeDir: "app/",
  sourcemaps: true,
  outFile: `${outputDir}/bundle.js`,
  plugins: [
    [
      SassPlugin(),
      PostCSS(POST_CSS_PLUGINS),
      CSSPlugin({ minify: false })
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
      },
      sourceMap: true
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

fuse.devServer(">index.js");
