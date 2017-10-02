import { checkForClinic } from '../../utils/decorators';

export default {
	treatmentSeries(ignored1, { patient_id, clinic_id, therapist_id }, ctx) {
		checkForClinic(clinic_id, ctx.currentUser);
		return ctx.Treatments.getSeries({ patient_id, clinic_id, therapist_id });
	},
};
