export default {
	treatments(series, _, { Treatments }) {
		return series && series.treatments || Treatments.getTreatments(series.id);
	},
	patient(series, _, { Users }) {
		return Users.findOne(series.patient_id);
	},
};
