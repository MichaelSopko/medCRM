import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Button, Icon } from 'antd'
import { connect } from 'react-redux'

import './ProfileWidget.scss'

const defaultAvatar = require('../../../assets/images/default_avatar.png');

@connect(
	({ currentUser }) => ({ currentUser })
)
class ProfileWidget extends Component {

	static contextTypes = {
		currentUser: PropTypes.object,
		intl: PropTypes.object.isRequired
	};

	render() {
		const { currentUser: { loading, first_name, last_name, login, role, email } } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		return (
			<div className="ProfileWidget">
				<div className="ProfileWidget__Avatar">
					<img src={ defaultAvatar } alt=""/>
				</div>
				{ !loading && <div className="ProfileWidget__Content">
					<div className="ProfileWidget__Name">
						{ !!first_name ? `${first_name} ${last_name}` : (email || login) }
						<span className="ProfileWidget__Role">{ formatMessage({ id: `roles.${role}` }) }</span>
					</div>

					<div className="ProfileWidget__Actions">
						<Button.Group size="small">
							<Button type="ghost" disabled>
								<Icon type="setting"/>{ formatMessage({ id: 'ProfileWidget.settings' }) }
							</Button>
							<Button type="ghost" onClick={ this.context.currentUser.logout }>
								<Icon type="logout"/>{ formatMessage({ id: 'ProfileWidget.logout' }) }
							</Button>
						</Button.Group>
					</div>
				</div> }
			</div>
		);
	}
}

export default ProfileWidget;
