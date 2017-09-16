import express from 'express';
import bodyParser from 'body-parser'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import http from 'http'
import https from 'https'
import path from 'path'
import jwt from 'express-jwt';
import fs from 'fs';

import { app as settings } from '../../package.json'
import log from '../log'
import Clinic from './sql/models/Clinic';
import Users from './sql/models/users';
import Treatments from './sql/models/treatments';

// Hot reloadable modules
let websiteMiddleware = require('./middleware/website').default;
let graphiqlMiddleware = require('./middleware/graphiql').default;
let graphqlMiddleware = require('./middleware/graphql').default;
let authenticationMiddleware = require('./middleware/authentication').default;
let uploadsMiddleware = require('./middleware/uploads').default;
let subscriptionManager = require('./graphql/subscriptions').subscriptionManager;

let server;

const app = express();

const port = process.env.PORT || settings.apiPort;

console.log('PORT: ' + process.env.PORT);
console.log('HTTP_PORT: ' + process.env.HTTP_PORT);

// Don't rate limit heroku
app.enable('trust proxy');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(settings.frontendBuildDir, { maxAge: '180 days' }));
app.use('/uploads', express.static(settings.uploadsDir, {
	setHeaders(res) {
		res.attachment();
	},
}));
if (__DEV__) {
	app.use('/assets', express.static(path.join(settings.backendBuildDir, 'assets'), { maxAge: '180 days' }));
} else {
	app.use('/assets', express.static(settings.frontendBuildDir, { maxAge: '180 days' }));
}

app.use('/graphql', jwt({ secret: settings.secret }), (...args) => graphqlMiddleware(...args));
app.use('/graphiql', (...args) => graphiqlMiddleware(...args));
app.use('/api/authentication', (...args) => authenticationMiddleware(...args));
app.use('/api/upload-file', jwt({ secret: settings.secret }), (...args) => uploadsMiddleware(...args));
app.use((...args) => websiteMiddleware(...args));

server = !__SSL__ ? http.createServer(app) : https.createServer({
	key: fs.readFileSync('keys/private.key'),
	cert: fs.readFileSync('keys/certificate.crt')
}, app);

if (__SSL__ && process.env.HTTP_PORT) {
	console.log("Running secured server");
	http.createServer(function (req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
		res.end();
	}).listen(process.env.HTTP_PORT);
}

new SubscriptionServer({
	subscriptionManager,
	onConnect: async (connectionParams, webSocket) => {
		return {
			Clinic: new Clinic(),
			Users: new Users(),
			Treatments: new Treatments(),
			currentUser: false, // TODO: implement security here
		};
	},
}, {
	server,
	path: '/',
});

server.listen(port, () => {
	log.info(`API is now running on port ${port}`);
});

server.on('close', () => {
	server = undefined;
});

if (module.hot) {
	try {
		module.hot.dispose(() => {
			if (server) {
				server.close();
			}
		});

		module.hot.accept();

		// Reload reloadable modules
		module.hot.accept('./middleware/website', () => {
			websiteMiddleware = require('./middleware/website').default;
		});
		module.hot.accept('./middleware/graphql', () => {
			graphqlMiddleware = require('./middleware/graphql').default;
		});
		module.hot.accept('./middleware/graphiql', () => {
			graphiqlMiddleware = require('./middleware/graphiql').default;
		});
		module.hot.accept('./graphql/subscriptions', () => {
			subscriptionManager = require('./graphql/subscriptions').subscriptionManager;
		});
		module.hot.accept('./middleware/authentication', () => {
			authenticationMiddleware = require('./middleware/authentication').default;
		});
		module.hot.accept('./middleware/uploads', () => {
			uploadsMiddleware = require('./middleware/uploads').default;
		});
	} catch (err) {
		log(err.stack);
	}
}
