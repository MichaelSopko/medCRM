/* eslint-disable import/no-extraneous-dependencies */
const { join } = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const webpackNodeExternals = require('webpack-node-externals');
const pkg = require('../package.json');

const APP_ENTRY_POINT = join(__dirname, '../src/server/index.js');

const buildNodeEnv = __DEV__ ? 'development' : 'production';
const serverPlugins = [
  new webpack.BannerPlugin({
    banner: 'require("source-map-support").install();',
    raw: true,
    entryOnly: false,
  }),
  new webpack.DefinePlugin({
    __CLIENT__: false,
    __SERVER__: true,
    __DEV__,
    'process.env.NODE_ENV': `"${buildNodeEnv}"`,
  }),
];

let devtool = 'cheap-module-source-map';

if (!__DEV__) {
  devtool = 'source-map';
}

const config = {
  target: 'node',

  entry: [
    'babel-polyfill',
    APP_ENTRY_POINT,
  ],

  node: {
    __dirname: true,
    __filename: true,
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: __DEV__ ? [
          'isomorphic-style-loader',
          'css-loader',
          'sass-loader'] : ['ignore-loader'],
      },
    ],
  },

  output: {
    devtoolModuleFilenameTemplate: __DEV__ ? '../../[resource-path]' : undefined,
    devtoolFallbackModuleFilenameTemplate: __DEV__ ? '../../[resource-path];[hash]' : undefined,
    filename: '[name].js',
    sourceMapFilename: '[name].[chunkhash].js.map',
    path: join(__dirname, '..', pkg.app.backendBuildDir),
    publicPath: '/',
  },

  plugins: serverPlugins,
  externals: [webpackNodeExternals()],
  devtool,
};

module.exports = merge.smart(_.cloneDeep(baseConfig), config);
