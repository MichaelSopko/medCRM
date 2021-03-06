import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import Login from './ui/containers/Login';
import SignUp from './ui/containers/Signup';
import Dashboard from './ui/containers/Dashboard';
import App from './ui/components/App';
import { Clinics, Patients, Therapists, Administrators, Calendar } from './ui/components/Dashboard';
import PatientObjectPrintPage from './ui/patient/containers/PatientObjectPrintPage';
import Settings from './ui/containers/Settings';

function authCheck(router, replace) {
  if (__CLIENT__) {
    const isLogged = !!localStorage.getItem('token');
    const pathName = router.location.pathname;

    if (!isLogged && (pathName !== '/login' && pathName !== '/signup')) {
      replace('/login');
    }
  }
}

export default (
  <Route path="/" component={App} onEnter={authCheck}>
    <IndexRedirect to="/dashboard" />
    <Route path="login" component={Login} />
    <Route path="signup" component={SignUp} />
    <Route path="print-object/:patient_id/:object_id" component={PatientObjectPrintPage} />
    <Route path="dashboard" component={Dashboard}>
      <Route path="clinics" component={Clinics} />
      <Route path="patients" component={Patients} />
      <Route path="therapists" component={Therapists} />
      <Route path="administrators" component={Administrators} />
      <Route path="calendar" component={Calendar} />
      <Route path="settings" component={Settings} />
    </Route>
  </Route>
);
