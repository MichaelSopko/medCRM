import React, { Component } from 'react'
import { Link } from 'react-router'
import { Menu, Icon } from 'antd';
import ProfileWidget from './ProfileWidget';
import CheckAccess from './helpers/CheckAccess'
import ROLES from '../../helpers/constants/roles'
import checkAccessLogic from '../../helpers/checkAccessLogic'
import PropTypes from 'prop-types';

import './UserNavbar.scss'

class UserNavbar extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired
	};

	state = {
		current: 'therapists'
	};

	render() {
		const currentEntity = this.context.router.routes[2] && this.context.router.routes[2].path;
		const { currentUser } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		return (
			<nav className="UserNavbar">
				<div className="Container">
					<Menu
						onClick={this.handleClick}
						selectedKeys={[currentEntity]}
						mode="horizontal">
						{ checkAccessLogic(currentUser.role, ROLES.SYSTEM_ADMIN) && <Menu.Item key="clinics">
							<Link to="/dashboard/clinics">{ formatMessage({ id: 'UserNavbar.clinics' }) }</Link>
						</Menu.Item> }
						{ checkAccessLogic(currentUser.role, ROLES.SYSTEM_ADMIN) && <Menu.Item key="administrators">
							<Link to="/dashboard/administrators">{ formatMessage({ id: 'UserNavbar.administrators' }) }</Link>
						</Menu.Item> }
						{ checkAccessLogic(currentUser.role, ROLES.CLINIC_ADMIN) && <Menu.Item key="therapists">
							<Link to="/dashboard/therapists">{ formatMessage({ id: 'UserNavbar.therapists' }) }</Link>
						</Menu.Item> }
						{ checkAccessLogic(currentUser.role, ROLES.THERAPIST) && <Menu.Item key="patients">
							<Link to="/dashboard/patients">{ formatMessage({ id: 'UserNavbar.patients' }) }</Link>
						</Menu.Item> }
						{ checkAccessLogic(currentUser.role, ROLES.THERAPIST) && <Menu.Item key="calendar">
							<Link to="/dashboard/calendar">{ formatMessage({ id: 'UserNavbar.calendar' }) }</Link>
						</Menu.Item> }
					</Menu>
					<ProfileWidget/>
				</div>
			</nav>
		);
	}
}

export default UserNavbar;
