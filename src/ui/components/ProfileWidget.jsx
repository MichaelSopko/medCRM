import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Button, Icon } from 'antd';
import { graphql } from 'react-apollo'

import GET_CURRENT_USER_QUERY from '../graphql/UserGetCurrent.graphql'

import './ProfileWidget.scss'

const defaultAvatar = require('../../../assets/images/default_avatar.png');

// TODO: add abstraction and dumb component

@graphql(GET_CURRENT_USER_QUERY)
class ProfileWidget extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired
	};

	static propTypes = {
		data: PropTypes.object
	};

	logout = () => {
		localStorage.removeItem('token');
		this.context.router.push('/login');
		this.props.client.resetStore();
	};

	componentWillReceiveProps(newProps) {
		if (newProps.data.error) {
			this.logout();
			return false;
		}
	}

	render() {
		const { data: { loading, currentUser, error } } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		return (
			<div className="ProfileWidget">
				<div className="ProfileWidget__Avatar">
					<img src={ defaultAvatar } alt=""/>
				</div>
				{ !loading && !error && <div className="ProfileWidget__Content">
					<div className="ProfileWidget__Name">
						{ currentUser.name || currentUser.login }
						<span className="ProfileWidget__Role">{ formatMessage({ id: `roles.${currentUser.role}` }) }</span>
					</div>

					<div className="ProfileWidget__Actions">
						<Button.Group size="small">
							<Button type="ghost" disabled>
								<Icon type="setting"/>Settings
							</Button>
							<Button type="ghost" onClick={ this.logout }>
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
