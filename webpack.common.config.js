const webpack = require('webpack');
const path = require('path');
const root = __dirname;
const absPath = relative => path.join(root, relative);

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const externalModules = [
  'http',
  'path',
  'express',
  'body-parser',
  'fs',
  'sql.js',
  'electron'
];

module.exports = version => [
  'client',
  'server',
  'electron'
].map(bundle => ({
  entry: {
    [bundle]: absPath(`${bundle}/index.js`)
  },
  output: {
    path: absPath('public/bundles'),
    filename: '[name].js'
  },
  target: {
    client: 'web',
    server: 'node',
    electron: 'electron'
  }[bundle],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&camelCase')
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(version)
      },
      PORT: JSON.stringify(process.env.npm_package_myWebServer_port),
      HOST: JSON.stringify(process.env.npm_package_myWebServer_host),
      REST_API_PATH: JSON.stringify(process.env.npm_package_myWebServer_restAPIpath),
      ROOT_DIR: JSON.stringify(root)
    })
  ],
  resolve: {
    alias: {
      store: absPath('client/store'),
      components: absPath('client/components'),
      utils: absPath('client/utils'),
      client: absPath('client'),
      server: absPath('server'),
      restAPI: absPath('client/utils/' + (
        bundle === 'electron'
          ? 'IPC'
          : 'http'
        )
      )
    }
  },
  externals: [
    function (context, request, callback) {
      // See: https://github.com/chentsulin/electron-react-boilerplate/issues/128
      // "Axios can't be packed by webpack"
      // Actually, it is only the HTTP adapter:
      if (
        context &&
        context.indexOf('axios/lib/core') !== -1 &&
        request.indexOf('adapters/http') !== -1
      ) {
        return callback(null, 'commonjs ' + path.join(context, request));
      }
      if (externalModules.indexOf(request) !== -1) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ]
}));
