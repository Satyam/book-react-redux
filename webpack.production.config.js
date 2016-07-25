const webpack = require('webpack');

module.exports = require('./webpack.common.config.js')('production').map(config => {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );
  return config;
});
