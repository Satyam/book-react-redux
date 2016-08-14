const config = require('./common')('development')[1];

config.entry = null;
config.output = null;
config.target = 'node';
config.devtool = 'source-map';

module.exports = config;
