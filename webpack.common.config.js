const webpack = require('webpack');
const path = require('path');
const join = path.join;
const root = __dirname;

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

module.exports = function (version) {
  return {
    entry: {
      client: join(root, 'client/index.js'),
      server: join(root, 'server/index.js'),
      electron: join(root, 'electron/index.js')
    },
    output: {
      path: join(root, 'public/bundles'),
      filename: '[name].js'
    },
    target: 'node',
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
          'NODE_ENV': JSON.stringify(version),
          'npm_package_myWebServer_port': JSON.stringify(process.env.npm_package_myWebServer_port),
          'npm_package_myWebServer_host': JSON.stringify(process.env.npm_package_myWebServer_host)
        },
        ROOT_DIR: JSON.stringify(root)
      })
    ],
    resolve: {
      alias: {
        store: join(root, 'client/store'),
        components: join(root, 'client/components'),
        utils: join(root, 'client/utils'),
        client: join(root, 'client'),
        server: join(root, 'server')
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
  };
};
