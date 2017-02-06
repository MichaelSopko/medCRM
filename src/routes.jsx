import React from 'react'
import { Route, IndexRedirect } from 'react-router'
import { connect } from 'react-router';

import Login from './ui/containers/Login'
import Dashboard from './ui/containers/Dashboard'
import App from './ui/components/App'
import { Clinics, Treatments, Patients, Therapists, Administrators } from './ui/components/Dashboard'

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
		<IndexRedirect to="/dashboard/clinics"/>
		<Route path="login" component={Login}/>
		<Route path="dashboard" component={Dashboard}>
			<Route path="clinics" component={Clinics}/>
			<Route path="treatments" component={Treatments}/>
			<Route path="patients" component={Patients}/>
			<Route path="therapists" component={Therapists}/>
			<Route path="administrators" component={Administrators}/>
		</Route>
	</Route>
);
