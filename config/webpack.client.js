/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base.js');

const buildNodeEnv = __DEV__ ? 'development' : 'production';
const clientPlugins = [
  new webpack.DefinePlugin({
    __CLIENT__: true,
    __DEV__,
    'process.env.NODE_ENV': `"${buildNodeEnv}"`,
  }),
];

if (!__DEV__) {
  clientPlugins.push(new ExtractTextPlugin('[name].min.css'));
  clientPlugins.push(new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor', 'manifest'],
  }));
  clientPlugins.push(new HtmlWebpackPlugin({
    filename: '../../dist/views/index.hbs',
    template: 'app/views/index.hbs',
  }));
}

const config = {
  entry: [
    'babel-polyfill',
    './src/client/index.jsx',
  ],

  output: {
    filename: '[name]-[chunkhash].js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },

  plugins: clientPlugins,
};

module.exports = merge(baseConfig, config);
