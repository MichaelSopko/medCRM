import React from 'react'
import { Route, IndexRedirect } from 'react-router'
import { connect } from 'react-router';

import Login from './ui/containers/Login'
import Dashboard from './ui/containers/Dashboard'
import App from './ui/components/App'
import { Clinics, Patients, Therapists, Administrators, Calendar } from './ui/components/Dashboard'

function authCheck(router, replace) {
	if (__CLIENT__) {
		const isLogged = !!localStorage.getItem('token');
		if (!isLogged && router.location.pathname !== '/login') {
			replace('/login');
		}
	}
}

export default (
	<Route path="/" component={App} onEnter={authCheck}>
		<IndexRedirect to="/dashboard"/>
		<Route path="login" component={Login}/>
		<Route path="dashboard" component={Dashboard}>
			<Route path="clinics" component={Clinics}/>
			<Route path="patients" component={Patients}/>
			<Route path="therapists" component={Therapists}/>
			<Route path="administrators" component={Administrators}/>
			<Route path="calendar" component={Calendar}/>
		</Route>
	</Route>
);
