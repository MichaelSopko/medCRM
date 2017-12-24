/* eslint-disable import/no-extraneous-dependencies */
const { join, resolve } = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const baseConfig = require('./webpack.base.js');
const mainConfig = require('./main');
const pkg = require('../package.json');

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
  new ExtractTextPlugin('[name].[contenthash].css', { allChunks: true }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest'],
  }),
  new webpack.DefinePlugin({
    __CLIENT__: true,
    __SERVER__: false,
    __DEV__,
    'process.env.NODE_ENV': `"${buildNodeEnv}"`,
  })
];
let devtool = 'inline-source-map';

let outputFileNamePattern = '[name]-[chunkhash].js';

if (!__DEV__) {
  devtool = 'hidden-source-map';
} else {
  outputFileNamePattern = '[name]-[hash]-[id].js';
  clientEntry.push('react-hot-loader/patch');
  clientEntry.push('webpack-hot-middleware/client?reload=true');
}

clientEntry.push(APP_ENTRY_POINT);

const config = {
  entry: {
    main: clientEntry,
    vendor: VENDOR_LIST,
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: __DEV__ ? ExtractTextPlugin.extract({
          use: [
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
            }],
          fallback: 'style-loader',
        }) : ExtractTextPlugin.extract({
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
