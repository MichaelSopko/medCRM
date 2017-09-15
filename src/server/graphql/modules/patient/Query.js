import ROLES from '../../../../helpers/constants/roles';

export default {
	patients(ignored1, { clinic_id, archived }, { Users }) {
		return Users.findByRole(ROLES.PATIENT, clinic_id, archived);
	},
	patient(_, { id }, { Users }) {
		return Users.findOne(id);
	},
};
