import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Menu, Icon } from 'antd';
import './UserNavbar.scss'

class UserNavbar extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	state = {
		current: 'therapists'
	};

	render() {
		const currentEntity = this.context.router.routes[2] && this.context.router.routes[2].path;

		return (
			<nav className="UserNavbar">
				<div className="Container">
					<Menu
						onClick={this.handleClick}
						selectedKeys={[currentEntity]}
						mode="horizontal">
						<Menu.Item key="clinics">
							<Link to="/dashboard/clinics">Clinics</Link>
						</Menu.Item>
						<Menu.Item key="therapists">
							<Link to="/dashboard/therapists">Therapists</Link>
						</Menu.Item>
						<Menu.Item key="patients">
							<Link to="/dashboard/patients">Patients</Link>
						</Menu.Item>
						<Menu.Item key="treatments">
							<Link to="/dashboard/treatments">Treatments</Link>
						</Menu.Item>
					</Menu>
				</div>
			</nav>
		);
	}
}

export default UserNavbar;
