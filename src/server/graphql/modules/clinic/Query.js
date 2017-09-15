import ROLES from '../../../../helpers/constants/roles';

export default {
	clinics(ignored1, ignored2, context) {
		return checkAccess(context, ROLES.SYSTEM_ADMIN)
			.then(() => context.Clinics.getClinics());
	},
	administrators(ignored1, ignored2, context) {
		return context.Users.findByRole(ROLES.CLINIC_ADMIN);
	},
	therapists(ignored1, { clinic_id }, context) {
		return context.Users.findByRole(ROLES.THERAPIST, clinic_id);
	},
};
