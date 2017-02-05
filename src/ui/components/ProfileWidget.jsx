import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Button, Icon } from 'antd'

import './ProfileWidget.scss'

const defaultAvatar = require('../../../assets/images/default_avatar.png');

class ProfileWidget extends Component {

	static contextTypes = {
		currentUser: PropTypes.object,
		intl: PropTypes.object.isRequired
	};

	render() {
		const { currentUser: { loading, first_name, last_name, login, role, logout } } = this.context;
		const formatMessage = this.context.intl.formatMessage;
		const fullName = `${first_name} ${last_name}`;

		return (
			<div className="ProfileWidget">
				<div className="ProfileWidget__Avatar">
					<img src={ defaultAvatar } alt=""/>
				</div>
				{ !loading && <div className="ProfileWidget__Content">
					<div className="ProfileWidget__Name">
						{ fullName.length > 1 ? fullName : login }
						<span className="ProfileWidget__Role">{ formatMessage({ id: `roles.${role}` }) }</span>
					</div>

					<div className="ProfileWidget__Actions">
						<Button.Group size="small">
							<Button type="ghost" disabled>
								<Icon type="setting"/>Settings
							</Button>
							<Button type="ghost" onClick={ logout }>
								<Icon type="logout"/>Log out
							</Button>
						</Button.Group>
					</div>
				</div> }
			</div>
		);
	}
}

export default ProfileWidget;
