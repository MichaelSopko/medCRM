/* eslint-disable no-underscore-dangle,import/no-extraneous-dependencies */
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
  basePlugins.push(new webpack.HotModuleReplacementPlugin());
  basePlugins.push(new webpack.NamedModulesPlugin());
}

const config = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules|models(\/|\\)TreatmentObject|helpers(\/|\\)SoftDeleteQueryBuilder|models(\/|\\)TreatmentSeries|models(\/|\\)Clinic|models(\/|\\)Treatment/,
        options: {
          babelrc: false,
          presets: [
            'react',
            'stage-0',
            ['env', {
              targets: {
                rowsers: ['last 2 versions'],
              },
            }],
          ],
          plugins: babelPlugins,
        },
      },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.graphqls/, loader: 'raw-loader' },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
      { test: /\.(woff2?|svg|png|ico|jpg|xml)$/, loader: 'url-loader?name=[hash].[ext]&limit=10000' },
      { test: /\.(ttf|eot)$/, loader: 'file-loader?name=[hash].[ext]' },
    ],
  },
  plugins: basePlugins,

  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

module.exports = config;
