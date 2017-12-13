const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const { resolve } = require('path');

const mainConfig = require('./main');

const APP_ENTRY_POINT = resolve(__dirname, '../app/client/index.js');
const VENDOR_LIST = mainConfig.VENDOR_LIST.slice();

const baseConfig = {
  entry: {
    main: [
      'babel-polyfill',
      APP_ENTRY_POINT,
    ],
    vendor: VENDOR_LIST,
  },
  output: {
    filename: '[name]-[chunkhash].js',
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
                minimize: true,
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
              },
            }],
          fallback: 'style-loader',
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].min.css'),
    // new UglifyJSPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    new HtmlWebpackPlugin({
      filename: '../../dist/views/index.hbs',
      template: 'app/views/index.hbs',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new FaviconsWebpackPlugin(path.join(__dirname, '../favicon.png')),
  ],
  resolve: {
    modules: [
      'node_modules',
    ],
  },
  devtool: 'source-map',
};

module.exports = baseConfig;
