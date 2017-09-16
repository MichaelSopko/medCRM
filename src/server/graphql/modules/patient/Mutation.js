import { catchForNonUniqueField, roleOnly } from '../../utils/decorators';
import ROLES from '../../../../helpers/constants/roles';
import moment from 'moment';

import { pubsub } from '../../schema';

export default {
	@roleOnly(ROLES.THERAPIST)
		@catchForNonUniqueField()
	async addPatient(_, { clinic_id, patient }, { Users, Clinic }) {
		const { patients_limit } = await Clinic.query().where('id', clinic_id).first();
		const patients = await Users.findByRole(ROLES.PATIENT, clinic_id);
		if (patients.length >= +patients_limit) {
			throw new Error(JSON.stringify({ code: 'PATIENTS_LIMIT', payload: patients_limit }));
		}

		const [id] = await Users.createUser({
			clinic_id,
			...patient,
			role: ROLES.PATIENT,
		});
		patient = await Users.findOne(id);
		pubsub.publish('patientCreated', patient);
		return patient;
	},
	@roleOnly(ROLES.THERAPIST)
		@catchForNonUniqueField()
	async editPatient(_, { id, patient }, context) {
		await context.Users.editUser({
			id,
			...patient
		});
		const updatedPatient = await context.Users.findOne(id);
		pubsub.publish('patientUpdated', updatedPatient);
		return updatedPatient;
	},
	@roleOnly(ROLES.THERAPIST)
	async deletePatient(_, { id }, context) {
		const patient = await context.Users.findOne(id);
		const res = await context.Users.deleteUser({ id });
		pubsub.publish('patientDeleted', patient);
		return patient;
	},
	@roleOnly(ROLES.THERAPIST)
	async unarchivePatient(_, { id }, { currentUser, Users, Clinic }) {
		const isAdmin = currentUser.role === ROLES.SYSTEM_ADMIN;
		const { clinic_id, archived_date } = await Users.findOne(id);
		const { patients_limit, archive_time } = await Clinic.query().findById(clinic_id);
		const patients = await Users.findByRole(ROLES.PATIENT, clinic_id);
		if (!isAdmin && patients.length >= +patients_limit) {
			throw new Error(JSON.stringify({ code: 'PATIENTS_LIMIT', payload: patients_limit }));
		}
		if (!isAdmin && archive_time && moment(archived_date).diff(moment(), 'minutes') < archive_time) {
			throw new Error(JSON.stringify({ code: 'TIME_LIMIT', payload: archive_time }));
		}
		await Users.editUser({ id, archived: false });
		return Users.findOne(id);
	},
	@roleOnly(ROLES.THERAPIST)
	async archivePatient(_, { id }, { Users }) {
		await Users.editUser({ id, archived: true, archived_date: moment().format('YYYY-MM-DD HH:mm:ss') });
		return Users.findOne(id);
	},
};
