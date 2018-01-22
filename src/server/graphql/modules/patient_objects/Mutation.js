import { roleOnly } from '../../utils/decorators';
import ROLES from '../../../../helpers/constants/roles';

import { pubsub } from '../../schema';

export default {
	@roleOnly(ROLES.THERAPIST)
	async addDiagnose(_, { input }, { Users }) {
		await Users.addDiagnose(input);
		const patient = await Users.findOne(input.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
	@roleOnly(ROLES.THERAPIST)
	async addTreatmentSummary(_, { input }, { Users }) {
		await Users.addTreatmentSummary(input);
		const patient = await Users.findOne(input.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
	@roleOnly(ROLES.THERAPIST)
	async editDiagnose(_, { id, input }, { Users }) {
		await Users.editDiagnose(id, input);
		const patient = await Users.findOne(input.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
	@roleOnly(ROLES.THERAPIST)
	async editTreatmentSummary(_, { id, input }, { Users }) {
		await Users.editTreatmentSummary(id, input);
		const patient = await Users.findOne(input.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},

	@roleOnly(ROLES.THERAPIST)
	async addPatientFile(_, { file }, { Users }) {
		await Users.addPatientFile(file);
		const patient = await Users.findOne(file.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
	async deletePatientFile(_, { id }, { Users }) {
		const file = await Users.getPatientFile(id);
		await Users.deletePatientFile(file.id);
		const patient = await Users.findOne(file.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
};
