import React from 'react';
import { createBatchingNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import he from 'react-intl/locale-data/he';
import enMessages from '../l10n/en.json';
import heMessages from '../l10n/he.json';
import moment from 'moment';
import { LocaleProvider } from 'antd';
import enUSAnt from 'antd/lib/locale-provider/en_US';
import heAnt from '../l10n/ant/he';
import config from '../../config/config';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

const locale = config.locale;

moment.locale(locale);

import createApolloClient from '../apollo_client';
import createReduxStore from '../redux_store';
import routes from '../routes';
import { app as settings } from '../../package.json';

import '../ui/styles.scss';

// Favicon.ico should not be hashed, since some browsers expect it to be exactly on /favicon.ico URL
require('!file?name=[name].[ext]!../assets/favicon.ico'); // eslint-disable-line import/no-webpack-loader-syntax

// Require all files from assets dir recursively addding them into assets.json
const req = require.context('!file?name=[hash].[ext]!../assets', true, /.*/);
req.keys().map(req);

function flattenMessages(nestedMessages, prefix = '') {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
}

addLocaleData([...he]);

let networkInterface = createBatchingNetworkInterface({
  opts: {
    credentials: 'same-origin',
  },
  batchInterval: 20,
  uri: '/graphql',
});


networkInterface.use([{
  applyBatchMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};
    }
    const token = localStorage.getItem('token');
    req.options.headers.authorization = token ? `Bearer ${token}` : null;
    next();
  },
}]);

const wsClient = new SubscriptionClient(window.location.origin.replace(/^http/, 'ws')
	.replace(`:${settings.webpackDevPort}`, `:${settings.apiPort}`));

networkInterface = addGraphQLSubscriptions(
	networkInterface,
	wsClient,
);

const client = createApolloClient(networkInterface);

let initialState = {};

if (window.__APOLLO_STATE__) {
  initialState = window.__APOLLO_STATE__;
}

const store = createReduxStore(initialState, client);

const history = syncHistoryWithStore(browserHistory, store);

const messages = locale === 'he' ? heMessages : enMessages;
const antMessages = locale === 'he' ? heAnt : enUSAnt;


export default class Main extends React.Component {
  render() {
    return (
      <IntlProvider locale={'en'} defaultLocale="en" messages={flattenMessages(messages)}>
        <LocaleProvider locale={antMessages}>
          <ApolloProvider store={store} client={client}>
            <Router history={history}>
              {routes}
            </Router>
          </ApolloProvider>
        </LocaleProvider>
      </IntlProvider>
    );
  }
}
