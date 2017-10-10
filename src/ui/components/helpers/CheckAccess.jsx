import React, { Component } from 'react'
import checkAccessLogic from '../../../helpers/checkAccessLogic'
import ROLES from '../../../helpers/constants/roles'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

@connect(
	({ currentUser }) => ({ currentUser })
)
export default class CheckAccess extends Component {

	static propTypes = {
		requiredRole: PropTypes.oneOf(Object.keys(ROLES)),
		children: PropTypes.element.isRequired
	};

	static contextTypes = {
		currentUser: PropTypes.object
	};

	render() {
		const { role, children, currentUser } = this.props;
		const isOk = currentUser && currentUser.role && checkAccessLogic(currentUser.role, role);

		return isOk ? children : false;
	}
}