import express from 'express';
import bodyParser from 'body-parser'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import http from 'http'
import path from 'path'
import jwt from 'express-jwt';

import { app as settings } from '../../package.json'
import log from '../log'

// Hot reloadable modules
let websiteMiddleware = require('./middleware/website').default;
let graphiqlMiddleware = require('./middleware/graphiql').default;
let graphqlMiddleware = require('./middleware/graphql').default;
let authenticationMiddleware = require('./middleware/authentication').default;
let uploadsMiddleware = require('./middleware/uploads').default;
let subscriptionManager = require('./api/subscriptions').subscriptionManager;

let server;

const app = express();

const port = process.env.PORT || settings.apiPort;

// Don't rate limit heroku
app.enable('trust proxy');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/assets', express.static(settings.frontendBuildDir, {maxAge: '180 days'}));
app.use('/uploads', express.static(settings.uploadsDir));
if (__DEV__) {
  app.use('/assets', express.static(path.join(settings.backendBuildDir, 'assets'), {maxAge: '180 days'}));
}

app.use('/graphql', jwt({ secret: settings.secret }), (...args) => graphqlMiddleware(...args));
app.use('/graphiql', (...args) => graphiqlMiddleware(...args));
app.use('/api/authentication', (...args) => authenticationMiddleware(...args));
app.use('/api/upload-file', jwt({ secret: settings.secret }), (...args) => uploadsMiddleware(...args));
app.use((...args) => websiteMiddleware(...args));

server = http.createServer(app);

new SubscriptionServer({
  subscriptionManager
}, server);

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
    module.hot.accept('./middleware/website', () => { websiteMiddleware = require('./middleware/website').default; });
    module.hot.accept('./middleware/graphql', () => { graphqlMiddleware = require('./middleware/graphql').default; });
    module.hot.accept('./middleware/graphiql', () => { graphiqlMiddleware = require('./middleware/graphiql').default; });
    module.hot.accept('./api/subscriptions', () => { subscriptionManager = require('./api/subscriptions').subscriptionManager; });
    module.hot.accept('./middleware/uploads', () => { authenticationMiddleware = require('./middleware/uploads').default; });
    module.hot.accept('./middleware/uploads', () => { uploadsMiddleware = require('./middleware/uploads').default; });
  } catch (err) {
    log(err.stack);
  }
}
