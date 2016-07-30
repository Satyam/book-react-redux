const webpack = require('webpack');
const path = require('path');
const join = path.join;
const root = __dirname;
const absPath = relative => join(root, relative);

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = version => [
  'client',
  'server',
  'electron',
  'electronClient'
].map(bundle => {
  const aliases = {
    store: absPath('client/store'),
    components: absPath('client/components'),
    utils: absPath('client/utils'),
    client: absPath('client'),
    server: absPath('server'),
    test: absPath('test'),
    restAPI: absPath('client/utils/' + (
      bundle === 'electronClient'
        ? 'IPC'
        : 'http'
      )
    )
  };
  return {
    entry: {
      [bundle]: absPath(`${bundle === 'electronClient' ? 'client' : bundle}/index.js`)
    },
    output: {
      path: absPath('public/bundles'),
      filename: '[name].js'
    },
    target: {
      client: 'web',
      server: 'node',
      electron: 'electron',
      electronClient: 'electron'
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
      new ExtractTextPlugin(`${bundle}.css`),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(version)
        },
        PORT: JSON.stringify(process.env.npm_package_myWebServer_port),
        HOST: JSON.stringify(process.env.npm_package_myWebServer_host),
        REST_API_PATH: JSON.stringify(process.env.npm_package_myWebServer_restAPIpath),
        ROOT_DIR: JSON.stringify(root),
        BUNDLE: JSON.stringify(bundle)
      })
    ],
    resolve: {
      alias: aliases
    },
    externals: [
      function (context, request, callback) {
        if (bundle !== 'client') {
          switch (request[0]) {
            case '.': {
              const absPath = join(context, request);
              if (absPath.indexOf('/node_modules/') > -1) {
                return callback(null, 'commonjs ' + absPath);
              }
              break;
            }
            case '/':
              break;
            default: {
              const firstPart = request.split('/')[0];
              if (Object.keys(aliases).indexOf(firstPart) === -1) {
                return callback(null, 'commonjs ' + request);
              }
              break;
            }
          }
        }
        callback();
      }
    ]
  };
});
