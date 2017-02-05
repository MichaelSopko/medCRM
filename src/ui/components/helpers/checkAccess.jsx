import React, { PropTypes } from 'react'
import checkAccessLogic from '../../../helpers/checkAccessLogic'
import ROLES from '../../../helpers/constants/roles'

export default function CheckAccess({ requiredRole, children }) {
	const { currentUser } = this.context;
	const isOk = currentUser && checkAccessLogic(currentUser.role, requiredRole);

	return isOk ? children : null;
}

CheckAccess.propTypes = {
	requiredRole: PropTypes.oneOf(Object.keys(ROLES)),
	children: PropTypes.element.isRequired
}

CheckAccess.contextTypes = {
	currentUser: PropTypes.object
}