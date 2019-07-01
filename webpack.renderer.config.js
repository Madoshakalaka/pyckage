const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new CopyWebpackPlugin( [{from:'src/static/*',to: 'main_window', flatten:true, dot:true}])
  ]
};
