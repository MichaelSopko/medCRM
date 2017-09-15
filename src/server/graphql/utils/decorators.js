import { UnauthorizedError } from './errors';
import ROLES from '../../../helpers/constants/roles'
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
			return method.call(this, root, params, ctx);
		} catch (e) {
			if (e.code === 'ER_DUP_ENTRY') {
				if (e.message.indexOf('users_email_unique') !== -1) throw new Error('DUPLICATE_EMAIL');
				if (e.message.indexOf('users_id_number_clinic_id_unique') !== -1) throw new Error('DUPLICATE_ID_NUMBER');
			}
			throw new Error(e);
		}
	};
};

