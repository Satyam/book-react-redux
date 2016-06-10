const path = require('path');
const join = path.join;
const root = __dirname;

module.exports = {
  entry: join(root, 'client/index.js'),
  output: {
    path: join(root, 'public/lib'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules&camelCase'
      }
    ]
  },
  resolve: {
    alias: {
      store: join(root, 'client/store'),
      components: join(root, 'client/components'),
      utils: join(root, 'client/utils')
    }
  }
};
