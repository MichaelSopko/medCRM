import moment from 'moment';

export default {
	treatments(series, _, { Treatments }) {
		return series && series.treatments || Treatments.getTreatments(series.id);
	},
	async objects(series, _, { Treatments, TreatmentObject }) {
		const [treatments, objects] = await Promise.all([
			Treatments.getTreatments(series.id),
			TreatmentObject.SchoolObservation.query().where('series_id', series.id),
		]);
		return [...treatments, ...objects].sort((a, b) => moment(a.start_date || a.date).valueOf() > moment(b.start_date || b.date).valueOf());
	},
	patient(series, _, { Users }) {
		return Users.findOne(series.patient_id);
	},
};
