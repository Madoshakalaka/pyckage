const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new CopyWebpackPlugin( [{from:'src/static/*',to: 'main_window', flatten:true, dot:true}]),
    new CopyWebpackPlugin( [{from:path.resolve(__dirname, 'src/main_window/css'),to: path.resolve(__dirname, '.webpack/renderer/main_window/css')}]),
    new CopyWebpackPlugin( [{from:path.resolve(__dirname, 'src/main_window/fonts'),to: path.resolve(__dirname, '.webpack/renderer/main_window/fonts')}]),
    // new CopyWebpackPlugin( [{from:'js/*',to: 'main_window', context:'src/'}])
  ]
};
