import { catchForNonUniqueField, roleOnly } from '../../utils/decorators';
import ROLES from '../../../../helpers/constants/roles';

export default {
	// Clinic
	@roleOnly(ROLES.SYSTEM_ADMIN)
	async addClinic(_, { clinic }, { Clinics }) {
		const [id] = await Clinics.addClinic(clinic);
		return Clinics.findOne(id);
	},
	@roleOnly(ROLES.SYSTEM_ADMIN)
	async editClinic(_, { id, clinic }, { Clinics }) {
		await Clinics.editClinic(id, clinic);
		return Clinics.findOne(id);
	},
	@roleOnly(ROLES.SYSTEM_ADMIN)
	async deleteClinic(_, { id }, { Clinics }) {
		return Clinics.deleteClinic({ id });
	},

	// Administrators

	@roleOnly(ROLES.SYSTEM_ADMIN)
		@catchForNonUniqueField()
	async addAdministrator(_, user, { Users }) {
		return Users.createUser({ ...user, role: ROLES.CLINIC_ADMIN });
	},
	@roleOnly(ROLES.SYSTEM_ADMIN)
		@catchForNonUniqueField()
	async editAdministrator(_, user, { Users }) {
		return Users.editUser(user);
	},
	@roleOnly(ROLES.SYSTEM_ADMIN)
	deleteAdministrator(_, { id }, { Users }) {
		return Users.deleteUser({ id });
	},

	// Therapists

	@roleOnly(ROLES.CLINIC_ADMIN)
		@catchForNonUniqueField()
	addTherapist(_, user, { Users }) {
		return Users.createUser({ ...user, role: ROLES.THERAPIST });
	},
	@roleOnly(ROLES.CLINIC_ADMIN)
		@catchForNonUniqueField()
	editTherapist(_, user, { Users }) {
		return Users.editUser(user);
	},
	@roleOnly(ROLES.CLINIC_ADMIN)
	deleteTherapist(_, { id }, { Users }) {
		return Users.deleteUser({ id });
	},

};
