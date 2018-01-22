/* eslint-disable import/no-extraneous-dependencies */
const { join, resolve } = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const baseConfig = require('./webpack.base.js');
const mainConfig = require('./main');
const pkg = require('../package.json');

const port = process.env.PORT || (pkg.app && pkg.app.apiPort) || 3000;
const VENDOR_LIST = mainConfig.VENDOR_LIST.slice();
const APP_ENTRY_POINT = resolve(__dirname, '../src/client/index.jsx');
const buildNodeEnv = __DEV__ ? 'development' : 'production';
const clientEntry = [
  'babel-polyfill',
];
const clientPlugins = [
  new ManifestPlugin({
    fileName: 'assets.json',
  }),
  new ExtractTextPlugin('[name].[contenthash].css', {
    allChunks: true,
    disable: buildNodeEnv === 'development',
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest'],
  }),
  new webpack.DefinePlugin({
    __CLIENT__: true,
    __SERVER__: false,
    __DEV__,
    'process.env.NODE_ENV': `"${buildNodeEnv}"`,
  }),
];
const hotReloadString = 'webpack-hot-middleware/client?reload=true';

let devtool = 'inline-source-map';
let outputFileNamePattern = '[name]-[chunkhash].js';

if (!__DEV__) {
  devtool = 'hidden-source-map';
  clientPlugins.push(
    new webpack.optimize.UglifyJsPlugin([
      {
        compressor: {
          warnings: false,
        },
        sourcemap: false,
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract([
          'css-loader?modules',
          'postcss-loader',
        ]),
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract([
          'css-loader?importLoaders=2&sourceMap',
          'postcss-loader?sourceMap=true',
          'sass-loader?outputStyle=expanded&sourceMap',
        ]),
      },
    ]),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.s?css$/,
      // threshold: 10240,
      minRatio: 0.8,
    })
  );
} else {
  outputFileNamePattern = '[name]-[hash]-[id].js';
  clientEntry.push('react-hot-loader/patch');
}

clientEntry.push(APP_ENTRY_POINT);

if (__DEV__) {
  clientEntry.push(hotReloadString);
  VENDOR_LIST.push(hotReloadString);
}

const config = {
  entry: {
    main: clientEntry,
    vendor: VENDOR_LIST,
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: __DEV__ ? [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded',
              sourceMap: true,
              sourceMapContents: true,
              outFile: resolve(__dirname, '..', pkg.app.frontendBuildDir),
            },
          }] : ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  sourceMap: true,
                  minimize: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  outputStyle: 'expanded',
                  sourceMap: true,
                },
              }],
            fallback: 'style-loader',
          }),
      },
    ],
  },

  output: {
    filename: outputFileNamePattern,
    path: resolve(__dirname, '..', pkg.app.frontendBuildDir),
    publicPath: '/',
  },

  plugins: clientPlugins,
  devtool,
};

module.exports = merge.smart(_.cloneDeep(baseConfig), config);
