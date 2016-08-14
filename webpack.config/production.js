const webpack = require('webpack');

module.exports = require('./common')('production').map(config => {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    })
  );
  return config;
});
