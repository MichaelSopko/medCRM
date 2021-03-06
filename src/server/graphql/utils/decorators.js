import { UnauthorizedError } from './errors';
import ROLES from '../../../helpers/constants/roles';
import checkAccessLogic from '../../../helpers/checkAccessLogic';

export const roleOnly = (requiredRole) => function (target, name, descriptor) {
	const method = descriptor.value;

	/* eslint-disable no-param-reassign */
	descriptor.value = async function (root, params, ctx) {
		if (!ctx.currentUser || !checkAccessLogic(ctx.currentUser.role, requiredRole)) {
			throw new UnauthorizedError({ data: { requiredRole } });
		}
		return method.call(this, root, params, ctx);
	};
};

export const catchForNonUniqueField = () => function (target, name, descriptor) {
	const method = descriptor.value;

	/* eslint-disable no-param-reassign */
	descriptor.value = async function (root, params, ctx) {
		try {
			const res = await method.call(this, root, params, ctx);
			return res;
		} catch (e) {
			// if (e.code === 'ER_DUP_ENTRY') {
				if (e.message.includes('users_email_unique')) throw new Error('DUPLICATE_EMAIL');
				if (e.message.includes('users_id_number_clinic_id_unique')) throw new Error('DUPLICATE_ID_NUMBER');
			// }
			throw new Error(e);
		}
	};
};


export const checkForClinic = (target, currentUser) => {
	if (currentUser.role === ROLES.SYSTEM_ADMIN) return;
	
	if (!target || +(isNaN(target) ? target.clinic_id : target) !== +currentUser.clinic_id) {
		throw new UnauthorizedError({ data: { requiredClinic: target.clinic_id } });
	}
};
