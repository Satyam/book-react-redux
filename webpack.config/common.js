const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const join = path.join;
const root = process.cwd();
const absPath = relative => join(root, relative);


module.exports = version => [
  'client',
  'server',
  'electron',
  'electronClient',
].map(bundle => {
  const aliases = {
    _store: absPath('client/store'),
    _components: absPath('client/components'),
    _utils: absPath('client/utils'),
    _server: absPath('server'),
    _test: absPath('test'),
  };
  return {
    entry: {
      [bundle]: absPath({
        client: 'client/index.jsx',
        server: 'server/index.js',
        electron: 'electron/index.js',
        electronClient: 'client/index.jsx',
      }[bundle]),
    },
    output: {
      path: absPath(bundle === 'client' ? 'public/bundles' : 'bundles'),
      filename: '[name].js',
    },
    target: {
      client: 'web',
      server: 'node',
      electron: 'electron',
      electronClient: 'electron',
    }[bundle],
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel',
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&camelCase'),
        },
      ],
    },
    plugins: [
      new ExtractTextPlugin(`${bundle}.css`),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(version),
        },
        PORT: JSON.stringify(process.env.npm_package_myWebServer_port),
        HOST: JSON.stringify(process.env.npm_package_myWebServer_host),
        REST_API_PATH: JSON.stringify(process.env.npm_package_myWebServer_restAPIpath),
        ROOT_DIR: JSON.stringify(root),
        BUNDLE: JSON.stringify(bundle),
      }),
    ],
    resolve: {
      alias: aliases,
      extensions: ['', '.js', '.jsx'],
    },
    externals: [
      (context, request, callback) => {
        if (bundle !== 'client') {
          switch (request[0]) {
            case '.': {
              const fullPath = join(context, request);
              if (fullPath.indexOf('/node_modules/') > -1) {
                return callback(null, `commonjs ${fullPath}`);
              }
              break;
            }
            case '/':
              break;
            default: {
              const firstPart = request.split('/')[0];
              if (Object.keys(aliases).indexOf(firstPart) === -1) {
                return callback(null, `commonjs ${request}`);
              }
              break;
            }
          }
        } else if (request === 'electron') {
          return callback(null, `commonjs ${request}`);
        }
        return callback();
      },
    ],
    stats: { children: false },
  };
});
