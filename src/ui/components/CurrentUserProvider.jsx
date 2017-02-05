import React, { PropTypes, Component } from 'react'
import { withApollo, graphql } from 'react-apollo'
import GET_CURRENT_USER_QUERY from '../graphql/UserGetCurrent.graphql'

@graphql(GET_CURRENT_USER_QUERY)
@withApollo
export default class CurrentUserProvider extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired
	};

	static propTypes = {
		data: PropTypes.object
	};

	static childContextTypes = {
		currentUser: PropTypes.object,
	};

	getChildContext() {
		const { data: { loading = false, currentUser = null } } = this.props;
		return {
			currentUser: {
				...currentUser,
				isLogged: !!currentUser,
				logout: ::this.logout,
				setToken: ::this.setToken,
				loading
			}
		}
	}

	setToken(token) {
		localStorage.setItem('token', token);
		this.props.client.resetStore();
	}

	logout() {
		// localStorage.removeItem('token');
		if (this.context.router.location.pathname !== '/login') {
			this.context.router.push('/login');
			this.props.client.resetStore();
		}
	}

	componentWillReceiveProps(newProps) {
		if (newProps.data.error) {
			console.error('CurrentUserProvider', newProps.data.error);
			this.logout();
			return false;
		}
	}

	render() {
		return this.props.children;
	}

}