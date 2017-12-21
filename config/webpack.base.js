/* eslint-disable no-underscore-dangle */
const webpack = require('webpack');

const babelPlugins = [
  'transform-strict-mode',
  'transform-runtime',
  'transform-decorators-legacy',
  'transform-class-properties',
];
const basePlugins = [];

global.__DEV__ = process.env.NODE_ENV !== 'production';
if (__DEV__) {
  babelPlugins.push('react-hot-loader/babel');
  basePlugins.push(new webpack.NamedModulesPlugin());
}

const config = {
  // Tell webpack to run babel on every file it runs through
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc: false,
          presets: [
            'react',
            'stage-0',
            ['env', { targets: { browsers: ['last 2 versions'] } }],
          ],
          plugins: babelPlugins,
        },
      },
      { test: /\.json$/, loader: 'json' },
      { test: /\.graphqls/, loader: 'raw' },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
      { test: /\.(woff2?|svg|png|ico|jpg|xml)$/, loader: 'url?name=[hash].[ext]&limit=10000' },
      { test: /\.(ttf|eot)$/, loader: 'file?name=[hash].[ext]' },
    ],
  },
  plugins: basePlugins,
};

module.exports = config;
