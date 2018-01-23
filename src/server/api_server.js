/* eslint-disable import/no-extraneous-dependencies,no-new */
import express from 'express';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import http from 'http';
import https from 'https';
import path from 'path';
import jwt from 'express-jwt';
import fs from 'fs';
import cookieParser from 'cookie-parser';

import { app as settings } from '../../package.json'
import log from '../log'
import Clinic from './sql/models/Clinic';
import TreatmentObject from './sql/models/TreatmentObject';
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


// const jwtMiddleware = jwt({
// 	secret: settings.secret,
// 	getToken: (req) => {
// 		if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
// 			return req.headers.authorization.split(' ')[1];
// 		} else if (req.cookies && req.cookies.token) {
// 			return req.cookies.token;
// 		}
// 		return null;
// 	}
// });

const port = process.env.PORT || settings.apiPort;

console.log('PORT: ' + process.env.PORT);
console.log('HTTP_PORT: ' + process.env.HTTP_PORT);

// Don't rate limit heroku
app.enable('trust proxy');
if (__DEV__) {
  // eslint-disable-next-line
  const webpackConfig = require('../../config/webpack.client');
  // eslint-disable-next-line
  const webpackHotMiddleware = require('webpack-hot-middleware');
  // eslint-disable-next-line
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    stats: 'minimal',
    publicPath: webpackConfig.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', express.static(settings.frontendBuildDir, { maxAge: '180 days' }));
app.use('/uploads', express.static(settings.uploadsDir, {
  setHeaders(res) {
	  res.attachment();
  },
}));
app.use('/documents', express.static('documents'));
if (__DEV__) {
  app.use('/assets', express.static(path.join(settings.backendBuildDir, 'assets'), { maxAge: '180 days' }));
} else {
  app.use('/assets', express.static(settings.frontendBuildDir, { maxAge: '180 days' }));
}
// app.use('/graphql', jwtMiddleware, (...args) => graphqlMiddleware(...args));

const jwtMiddleware = jwt({ secret: settings.secret });

app.use('/graphql', (req, res, next) => {
  const { body } = req;
  if (Array.isArray(body) && typeof body[0] === 'object' && body[0].operationName === 'signUp') { // todo
    next();
  } else {
    jwtMiddleware(req, res, next);
  }
});
app.use('/graphql', (...args) => graphqlMiddleware(...args));
app.use('/graphiql', (...args) => graphiqlMiddleware(...args));
app.use('/api/authentication', (...args) => authenticationMiddleware(...args));
app.use('/api/upload-file', jwt({ secret: settings.secret }), (...args) => uploadsMiddleware(...args));
app.use((...args) => websiteMiddleware(...args));

server = http.createServer(app);

// server = !__SSL__ ? http.createServer(app) : https.createServer({
// 	key: fs.readFileSync('keys/private.key'),
// 	cert: fs.readFileSync('keys/certificate.crt')
// }, app);

// if (__SSL__ && process.env.HTTP_PORT) {
// 	console.log("Running secured server");
// 	http.createServer(function (req, res) {
// 		res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
// 		res.end();
// 	}).listen(process.env.HTTP_PORT);
// }

new SubscriptionServer({
	subscriptionManager,
	onConnect: async (connectionParams, webSocket) => {
		return {
			Clinic,
			TreatmentObject,
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
