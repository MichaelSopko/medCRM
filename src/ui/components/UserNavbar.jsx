import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Menu, Icon } from 'antd';
import './UserNavbar.scss'

class UserNavbar extends Component {

	state = {
		current: 'therapists'
	}

	render() {
		return (
			<nav className="UserNavbar">
				<div className="Container">
					<Menu
						onClick={this.handleClick}
						selectedKeys={[this.state.current]}
						mode="horizontal">
						<Menu.Item key="therapists">
							<Link to="/users">Therapists</Link>
						</Menu.Item>
						<div style={ { flex: 1 } }></div>
						<Menu.Item>
							<Icon type="poweroff" />Log out
						</Menu.Item>
					</Menu>
				</div>
			</nav>
		);
	}
}

export default UserNavbar;
