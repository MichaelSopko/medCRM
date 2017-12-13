const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const webpack = require('webpack');
const path = require('path');
const { resolve } = require('path');

const mainConfig = require('./main');

const APP_ENTRY_POINT = resolve(__dirname, '../app/client/index.js');
const VENDOR_LIST = mainConfig.VENDOR_LIST.slice();

VENDOR_LIST.push('redux-logger');

const baseConfig = {
  entry: {
    main: [
      'babel-polyfill',
      // https://github.com/gaearon/react-hot-loader
      'react-hot-loader/patch',
      // https://github.com/glenjamin/webpack-hot-middleware
      'webpack-hot-middleware/client?reload=true',
      APP_ENTRY_POINT,
    ],
    vendor: VENDOR_LIST,
  },
  output: {
    filename: '[name]-[hash]-[id].js',
    // the output bundle
    path: resolve(__dirname, '..', 'dist', 'public'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['env', {
                modules: false,
              }],
              'stage-2',
              'react',
            ],
            plugins: [
              'transform-strict-mode',
              'transform-runtime',
              'transform-decorators-legacy',
              'react-hot-loader/babel',
            ],
          },
        },
        exclude: [/node_modules/, /app\/views/],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: mainConfig.localIdentName,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 2,
                sourceMap: true,
                localIdentName: mainConfig.localIdentName,
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
                outFile: resolve(__dirname, '..', 'dist', 'public'),
              },
            }],
          fallback: 'style-loader',
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('style.css'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    new HtmlWebpackPlugin({
      alwaysWriteToDisk: true,
      filename: 'index.hbs',
      template: 'app/views/index.hbs',
    }),
    new HtmlWebpackHarddiskPlugin({
      // set the output to the build directory
      outputPath: path.join(__dirname, '../dist/views'),
    }),
    new FaviconsWebpackPlugin(path.join(__dirname, '../favicon.png')),
  ],
  devtool: 'inline-source-map',
};

module.exports = baseConfig;
