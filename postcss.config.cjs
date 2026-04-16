module.exports = {
  plugins: [
    require('postcss-transform-shortcut'),
    require('autoprefixer')('last 2 versions'),
  ],
};
