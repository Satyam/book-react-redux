const webpack = require('webpack');

const config = require('./webpack.common.config.js')('production');
config.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    }
  })
);

module.exports = config;
