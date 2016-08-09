const config = require('./webpack.common.config')('development')[1];

config.entry = null;
config.output = null;
config.target = 'node';
config.devtool = 'source-map';

module.exports = config;
