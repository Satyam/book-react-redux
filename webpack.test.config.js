const path = require('path');

const config = require('./webpack.common.config.js')('development');
config.entry = null;
config.output = null;
config.target = 'node';
config.devtool = 'source-map';
config.resolve.alias.test = path.join(__dirname, 'test');

const aliases = Object.keys(config.resolve.alias);

config.externals = [
  function (context, request, callback) {
    if (request[0] === '.') {
      const absPath = path.join(context, request);
      if (absPath.indexOf('/node_modules/') > -1) {
        return callback(null, 'commonjs ' + absPath);
      }
    } else {
      const firstPart = request.replace(`${__dirname}/`, '').split('/')[0];
      if (aliases.indexOf(firstPart) === -1) {
        return callback(null, 'commonjs ' + request);
      }
    }
    callback();
  }
];

module.exports = config;
