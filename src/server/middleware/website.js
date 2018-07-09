import React from 'react';
import ReactDOM from 'react-dom/server';
import { match } from 'react-router';
import fs from 'fs';
import path from 'path';

import Html from '../../ui/components/Html';
import routes from '../../routes';
import log from '../../log';
import { app as settings } from '../../../package.json';

let assetMap;

export default (req, res) => {
    match({ routes, location: req.originalUrl }, (error, redirectLocation, renderProps) => {
        if (redirectLocation) {
            res.redirect(redirectLocation.pathname + redirectLocation.search);
        } else if (error) {
            log.error('ROUTER ERROR:', error);
            res.status(500);
        } else if (renderProps) {
            if (__DEV__ || !assetMap) {
                assetMap = JSON.parse(fs.readFileSync(path.join(settings.frontendBuildDir, 'assets.json')));
            }
            const page = <Html content="" state={({})} assetMap={assetMap} />;
            res.send(`<!doctype html>\n${ReactDOM.renderToStaticMarkup(page)}`);
            res.end();
        } else {
            res.status(404).send('Not found');
        }
    });
};
