const APP_NAME = 'tmapp';

module.exports = {
  APP_NAME,
  // Identify and allow module loading for css|scss
  localIdentName: `${APP_NAME}__[local]`,
  // For separate js files into vendor bundle
  VENDOR_LIST: [
    'axios',
    'classnames',
    'lodash',
    'react',
    'react-dom',
    'react-redux',
    'react-router',
    'react-router-dom',
    'redux',
    'redux-form',
    'redux-thunk',
    'redux-promise',
  ],
};
