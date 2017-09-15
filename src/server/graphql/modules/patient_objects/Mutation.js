import { roleOnly } from '../../utils/decorators';
import ROLES from '../../../../helpers/constants/roles';

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

	async addPatientFile(_, { file }, ctx) {
		await checkAccess(ctx, ROLES.THERAPIST)
		const { Users } = ctx;
		await Users.addPatientFile(file);
		const patient = await Users.findOne(file.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
	async deletePatientFile(_, { id }, ctx) {
		await checkAccess(ctx, ROLES.THERAPIST)
		const { Users } = ctx;
		const file = await Users.getPatientFile(id);
		await Users.deletePatientFile(file.id);
		const patient = await Users.findOne(file.patient_id);
		pubsub.publish('patientUpdated', patient);
		return patient;
	},
};
