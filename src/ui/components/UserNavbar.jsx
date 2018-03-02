import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import ProfileWidget from './ProfileWidget';

import './UserNavbar.scss';

class UserNavbar extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired,
	};

	state = {
		current: 'therapists',
	};

	render() {
		const currentEntity = this.context.router.routes[2] && this.context.router.routes[2].path;
		const { currentUser, toggleSidebar } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		return (
			<header className="main-header">
				<Link to="/" className="logo"><span className="logo-lg"><b>Clinics</b>CRM</span></Link>
				<nav className="navbar navbar-static-top">
					<div className="nav-content">
						<a
							href="javascript:;"
							className="sidebar-toggle fa fa-navicon"
							data-toggle="push-menu"
							role="button"
							onClick={toggleSidebar}
						>
							<span className="sr-only">Toggle navigation</span>
						</a>
					</div>
					<ProfileWidget />
				</nav>
			</header>
		);
	}
}

export default UserNavbar;
