import React from 'react'
import { createBatchingNetworkInterface } from 'apollo-client'
import { Client } from 'subscriptions-transport-ws';
import { ApolloProvider } from 'react-apollo'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import createApolloClient from '../apollo_client'
import createReduxStore from '../redux_store'
import addGraphQLSubscriptions from './subscriptions'
import routes from '../routes'
import { app as settings} from '../../package.json'

import '../ui/styles.scss'

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


export default class Main extends React.Component {
  render() {
    return (
      <ApolloProvider store={store} client={client}>
        <Router history={history}>
          {routes}
        </Router>
      </ApolloProvider>
    );
  }
}