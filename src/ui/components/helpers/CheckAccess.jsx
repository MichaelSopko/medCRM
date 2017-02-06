import React, { PropTypes, Component } from 'react'
import checkAccessLogic from '../../../helpers/checkAccessLogic'
import ROLES from '../../../helpers/constants/roles'

export default class CheckAccess extends Component {

	static propTypes = {
		requiredRole: PropTypes.oneOf(Object.keys(ROLES)),
		children: PropTypes.element.isRequired
	}

	static contextTypes = {
		currentUser: PropTypes.object
	}

	render() {
		const { requiredRole, children } = this.props;
		const { currentUser } = this.context;
		const isOk = currentUser && currentUser.role && checkAccessLogic(currentUser.role, requiredRole);

		return isOk ? children : null;
	}
}