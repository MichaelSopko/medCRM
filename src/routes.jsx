import React from 'react'
import { Route, IndexRedirect } from 'react-router'

import Counter from './ui/containers/Counter'
import Login from './ui/containers/Login'
import Dashboard from './ui/containers/Dashboard'
import App from './ui/components/App'

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="/dashboard" />
    <Route path="counter" component={Counter} />
    <Route path="login" component={Login} />
    <Route path="dashboard" component={Dashboard} />
  </Route>
);
