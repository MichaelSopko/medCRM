const APP_NAME = 'tmapp';

module.exports = {
  APP_NAME,
  // Identify and allow module loading for css|scss
  localIdentName: `${APP_NAME}__[local]`,
  // For separate js files into vendor bundle
  VENDOR_LIST: [
    'antd',
    'apollo-client',
    'classnames',
    'color-hash',
    'lodash',
    'isomorphic-fetch',
    'moment',
    'react',
    'react-redux',
    'react-router',
    'react-addons-update',
    'react-apollo',
    'react-big-calendar',
    'react-dnd',
    'react-dnd-html5-backend',
    'react-dom',
    'react-intl',
    'react-nl2br',
    'react-router-redux',
    'redux',
    'subscriptions-transport-ws',
  ],
};
