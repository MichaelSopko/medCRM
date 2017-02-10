import React from 'react'
import { createBatchingNetworkInterface } from 'apollo-client'
import { Client } from 'subscriptions-transport-ws';
import { ApolloProvider } from 'react-apollo'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import he from 'react-intl/locale-data/he';
import enMessages from '../l10n/en.json';
import heMessages from '../l10n/he.json';
import moment from 'moment';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import { locale } from '../../config.json';

moment.locale(locale);

import createApolloClient from '../apollo_client'
import createReduxStore from '../redux_store'
import addGraphQLSubscriptions from './subscriptions'
import routes from '../routes'
import { app as settings } from '../../package.json'

import '../ui/styles.scss'

function flattenMessages(nestedMessages, prefix = '') {
	return Object.keys(nestedMessages).reduce((messages, key) => {
		let value = nestedMessages[key];
		let prefixedKey = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'string') {
			messages[prefixedKey] = value;
		} else {
			Object.assign(messages, flattenMessages(value, prefixedKey));
		}

		return messages;
	}, {});
}

addLocaleData([...he]);

const wsClient = new Client(window.location.origin.replace(/^http/, 'ws')
	.replace(':' + settings.webpackDevPort, ':' + settings.apiPort));

const networkInterface = createBatchingNetworkInterface({
	opts: {
		credentials: "same-origin",
	},
	batchInterval: 20,
	uri: "/graphql",
});

networkInterface.use([{
	applyMiddleware(req, next) {
		if (!req.options.headers) {
			req.options.headers = {};
		}
		const token = localStorage.getItem('token');
		req.options.headers.authorization = token ? `Bearer ${token}` : null;
		next();
	}
}]);

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
	networkInterface,
	wsClient,
);

const client = createApolloClient(networkInterfaceWithSubscriptions);

let initialState = {};

if (window.__APOLLO_STATE__) {
	initialState = window.__APOLLO_STATE__;
}

const store = createReduxStore(initialState, client);

const history = syncHistoryWithStore(browserHistory, store);

const messages = locale === 'he' ? heMessages : enMessages;


export default class Main extends React.Component {
	render() {
		return (
			<IntlProvider locale={'en'} defaultLocale='en' messages={ flattenMessages(messages) }>
				<LocaleProvider locale={enUS}>
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