import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

import UserNavbar from '../components/UserNavbar';

class Dashboard extends Component {
	render() {
		return (
			<main className="Dashboard">
				<UserNavbar/>
				<div className="Container">
					Dashboard
				</div>
			</main>
		);
	}
}

export default Dashboard;
