import ROLES from '../../../../helpers/constants/roles';
import { roleOnly } from '../../utils/decorators';

export default {
	@roleOnly(ROLES.SYSTEM_ADMIN)
	clinics(ignored1, ignored2, {Clinic}) {
		return Clinic.query();
	},
	@roleOnly(ROLES.CLINIC_ADMIN)
	administrators(ignored1, ignored2, context) {
		return context.Users.findByRole(ROLES.CLINIC_ADMIN);
	},
	@roleOnly(ROLES.THERAPIST)
	therapists(ignored1, { clinic_id }, context) {
		return context.Users.findByRole(ROLES.THERAPIST, clinic_id);
	},
};
