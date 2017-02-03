import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

import UserNavbar from '../components/UserNavbar'
import './Dashboard.scss'

class Dashboard extends Component {
	render() {
		const { children } = this.props;

		return (
			<main className="Dashboard">
				<UserNavbar/>
				<div className="Container">
					{ children }
				</div>
			</main>
		);
	}
}

export default Dashboard;
