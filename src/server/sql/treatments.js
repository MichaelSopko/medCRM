import knex from './connector'

export default class Treatments {

	getSeries(clinic_id) {
		return knex('treatment_series')
			.where('clinic_id', clinic_id)
			.select();
	}

	getTreatments(series_id) {
		return knex('treatments')
			.where('series_id', series_id)
			.select();
	}

	addSeries(fields) {
		return knex('treatment_series')
			.insert(fields);
	}

	editSeries({ id, ...fields }) {
		return knex('treatment_series')
			.where('id', id)
			.update(fields);
	}

	deleteSeries({ id }) {
		return Promise.all([
			knex('treatment_series')
				.where('id', id)
				.delete()
		]);
	}

	addTreatment(fields) {
		if ('therapist_ids' in fields) {
			fields.therapist_ids = JSON.stringify(fields.therapist_ids);
		}
		if ('patient_ids' in fields) {
			fields.patient_ids = JSON.stringify(fields.patient_ids);
		}
		return knex('treatments')
			.insert(fields)
	}

	editTreatment({ id, ...fields }) {
		if ('therapist_ids' in fields) {
			fields.therapist_ids = JSON.stringify(fields.therapist_ids);
		}
		if ('patient_ids' in fields) {
			fields.patient_ids = JSON.stringify(fields.patient_ids);
		}
		return knex('treatments')
			.where('id', id)
			.update(fields);
	}

	deleteTreatment({ id }) {
		return Promise.all([
			knex('treatments')
				.where('id', id)
				.delete()
		]);
	}

}
