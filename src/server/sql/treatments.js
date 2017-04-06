import knex from './connector'

const safeParse = (json, deflt = []) => {
	try {
		if (json == null) {
			return deflt;
		}
		return JSON.parse(json || `${deflt}`)
	} catch (e) {
		console.error('JSON parse error', json, e);
		return deflt;
	}
}

export default class Treatments {

	getSeries(patient_id) {
		return knex('treatment_series')
			.where('patient_id', patient_id)
			.orderBy('id', 'DESC')
			.select();
	}

	getSeriesByPatient(patient_id) {
		return knex('treatment_series')
			.where('patient_id', patient_id)
			.orderBy('id', 'DESC')
			.select();
	}

	async findOne(id) {
		const [series, treatments] = await Promise.all([
			knex('treatment_series')
				.where('id', id)
				.first(),
			knex('treatments')
				.where('series_id', id)
				.select()
				.then(treatments => treatments.map(async treatment => {
					const [therapists, patients] = await Promise.all([
						knex('users').whereIn('id', safeParse(treatment.therapist_ids)).select(),
						knex('users').whereIn('id', safeParse(treatment.patient_ids)).select()
					]);
					return {
						...treatment,
						therapists,
						patients
					};
				}))
		]);
		series.treatments = treatments || [];
		return series;
	}

	findOneTreatment(id) {
		return knex('treatments')
			.where('id', id)
			.first();
	}

	getTreatments(series_id) {
		return knex('treatments')
			.where('series_id', series_id)
			.select();
	}

	addSeries(fields) {
		return knex('treatment_series')
			.insert(fields)
			.returning('*');
	}

	editSeries({ id, ...fields }) {
		return knex('treatment_series')
			.where('id', id)
			.update(fields);
	}

	deleteSeries({ id }) {
		return knex('treatments').where('series_id', id).delete().then(() => {
			return knex('treatment_series').where('id', id).delete();
		});
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
			.returning('*')
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
