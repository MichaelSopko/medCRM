import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import ROLES from '../../helpers/constants/roles'
import { Spin } from 'antd'

import UserNavbar from '../components/UserNavbar'
import './Dashboard.scss'

@connect(
	({ currentUser }) => ({ currentUser })
)
class Dashboard extends Component {

	static contextTypes = {
		router: PropTypes.object
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
					router.push('/patients');
					break;
			}
		}
		if (!currentUser) {
			router.push('/login');
		}
	}

	render() {
		const { children, currentUser } = this.props;
		const showSpinner = !currentUser;
		this.checkRedirect(this.props);

		return (
			<main className="Dashboard">
				{ showSpinner && <div className="SplashSpinner">
					<Spin size="large"/>
				</div> }
				{ !showSpinner && <UserNavbar currentUser={currentUser}/> }
				{ !showSpinner && currentUser && children }
			</main>
		);
	}
}

export default Dashboard;
