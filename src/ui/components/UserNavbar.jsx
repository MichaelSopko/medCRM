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
			<header className="main-header">
				<a href="../index2.html" className="logo">
					{/*<span className="logo-mini"><b>A</b>LT</span>*/}
					<span className="logo-lg"><b>Clinics</b>CRM</span>
				</a>
				<nav className="navbar navbar-static-top">
					<div className="nav-content">
						<a href="#" className="sidebar-toggle fa fa-navicon" data-toggle="push-menu" role="button">
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

{/*<nav className="UserNavbar">*/}
{/*<div className="Container">*/}
{/*<Menu*/}
{/*onClick={this.handleClick}*/}
{/*selectedKeys={[currentEntity]}*/}
{/*mode="horizontal">*/}
{/*{ checkAccessLogic(currentUser.role, ROLES.SYSTEM_ADMIN) && <Menu.Item key="clinics">*/}
{/*<Link to="/dashboard/clinics">{ formatMessage({ id: 'UserNavbar.clinics' }) }</Link>*/}
{/*</Menu.Item> }*/}
{/*{ checkAccessLogic(currentUser.role, ROLES.SYSTEM_ADMIN) && <Menu.Item key="administrators">*/}
{/*<Link to="/dashboard/administrators">{ formatMessage({ id: 'UserNavbar.administrators' }) }</Link>*/}
{/*</Menu.Item> }*/}
{/*{ checkAccessLogic(currentUser.role, ROLES.CLINIC_ADMIN) && <Menu.Item key="therapists">*/}
{/*<Link to="/dashboard/therapists">{ formatMessage({ id: 'UserNavbar.therapists' }) }</Link>*/}
{/*</Menu.Item> }*/}
{/*{ checkAccessLogic(currentUser.role, ROLES.THERAPIST) && <Menu.Item key="patients">*/}
{/*<Link to="/dashboard/patients">{ formatMessage({ id: 'UserNavbar.patients' }) }</Link>*/}
{/*</Menu.Item> }*/}
{/*{ checkAccessLogic(currentUser.role, ROLES.THERAPIST) && <Menu.Item key="calendar">*/}
{/*<Link to="/dashboard/calendar">{ formatMessage({ id: 'UserNavbar.calendar' }) }</Link>*/}
{/*</Menu.Item> }*/}
{/*</Menu>*/}
{/*<ProfileWidget/>*/}
{/*</div>*/}
{/*</nav>*/}