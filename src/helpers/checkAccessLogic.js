import ROLES from './constants/roles'

export default function checkAccessLogin(currentRole, requiredRole) {
	const userWeight = Object.keys(ROLES).indexOf(currentRole);
	const requiredWeight = Object.keys(ROLES).indexOf(requiredRole);

	if (!requiredRole && userWeight !== -1) {
		return true; // True if no required role and user authenticated
	}

	if (requiredWeight === -1) {
		throw new Error('Invalid user role');
	}

	return userWeight >= requiredWeight;
}