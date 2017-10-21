import { catchForNonUniqueField, roleOnly } from '../../utils/decorators';
import ROLES from '../../../../helpers/constants/roles';
import { UnauthorizedError } from '../../utils/errors';

export default {
	// Clinic
	@roleOnly(ROLES.SYSTEM_ADMIN)
	async addClinic(_, { clinic }, { Clinic }) {
		return Clinic.query().insertAndFetch(clinic);
	},
	@roleOnly(ROLES.SYSTEM_ADMIN)
	async editClinic(_, { id, clinic }, { Clinic }) {
		return Clinic.query().updateAndFetchById(id, clinic);
	},
	@roleOnly(ROLES.SYSTEM_ADMIN)
	async deleteClinic(_, { id }, { Clinic }) {
		return Clinic.softDeleteById(id);
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
	async createTherapist(_, { clinic_id, therapist }, { Users }) {
		const [id] = await Users.createUser({ clinic_id, ...therapist, role: ROLES.THERAPIST });
		return Users.findOne(id);
	},
	@roleOnly(ROLES.THERAPIST)
	@catchForNonUniqueField()
	async updateTherapist(_, { id, therapist }, { Users, currentUser }) {
		// allow user update himself
		if (currentUser.role === ROLES.THERAPIST && +id !== +currentUser.id) {
			throw new UnauthorizedError();
		}
		await Users.editUser({ id, ...therapist });
		return Users.findOne(id);
	},
	@roleOnly(ROLES.CLINIC_ADMIN)
	deleteTherapist(_, { id }, { Users }) {
		return Users.deleteUser({ id });
	},

};
