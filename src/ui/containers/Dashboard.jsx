import React, { Component } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import ROLES from '../../helpers/constants/roles'
import { Spin } from 'antd'
import PropTypes from 'prop-types';

import UserNavbar from '../components/UserNavbar';
import NavBar from '../components/NavBar';

import './Dashboard.scss';

@connect(
	({ currentUser }) => ({ currentUser }),
)
class Dashboard extends Component {

  static contextTypes = {
    router: PropTypes.object,
  };
  
  state = {
	  sidebarCollapsed: false
  };

  checkRedirect({ location, router, currentUser }) {
    if (currentUser && location.pathname === '/dashboard') {
      switch (currentUser.role) {
        case ROLES.SYSTEM_ADMIN:
          router.push('/dashboard/clinics');
          break;
        case ROLES.CLINIC_ADMIN:
          router.push('/dashboard/therapists');
          break;
        case ROLES.THERAPIST:
          router.push('/dashboard/patients');
          break;
      }
    }
    if (!currentUser) {
      router.push('/login');
    }
  }
	
	toggleSidebarHandler() {
      this.setState({sidebarCollapsed: !this.state.sidebarCollapsed});
    }

  render() {
    const { children, currentUser } = this.props;
    const showSpinner = !currentUser;
	this.checkRedirect(this.props);

    return (
      <main className={"Dashboard " + (this.state.sidebarCollapsed ? 'sidebar-collapse': '') }>
        { showSpinner && <div className="SplashSpinner">
          <Spin size="large" />
        </div> }
        { !showSpinner && <UserNavbar currentUser={currentUser} toggleSidebar={this.toggleSidebarHandler.bind(this)} /> }
        { !showSpinner && <NavBar currentUser={currentUser} /> }
        { !showSpinner && currentUser && <div className="content-wrap">{ children }</div> }
      </main>
    );
  }
}

export default Dashboard;
