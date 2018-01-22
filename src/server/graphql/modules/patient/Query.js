import ROLES from '../../../../helpers/constants/roles';
import { checkForClinic, roleOnly } from '../../utils/decorators';

export default {
	@roleOnly(ROLES.THERAPIST)
	patients(ignored1, { clinic_id, archived }, { Users, currentUser }) {
		checkForClinic(clinic_id, currentUser);
		return Users.findByRole(ROLES.PATIENT, clinic_id, archived);
	},
	@roleOnly(ROLES.THERAPIST)
	async patient(_, { id }, { Users, currentUser }) {
		const patient = await Users.findOne(id);
		checkForClinic(patient, currentUser);
		return patient;
	},
};
