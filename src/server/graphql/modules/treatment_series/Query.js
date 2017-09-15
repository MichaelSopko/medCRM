export default {
	treatmentSeries(ignored1, { patient_id, clinic_id, therapist_id }, ctx) {
		return ctx.Treatments.getSeries({ patient_id, clinic_id, therapist_id });
	},
};
