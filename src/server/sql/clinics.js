import knex from './connector'

export default class Clinics {
	getClinics() {
		return knex('clinics').select();
	}

	addClinic(fields) {
		return knex('clinics')
			.insert(fields);
	}

	editClinic({ id, ...fields }) {
		return knex('clinics')
			.where('id', id)
			.update(fields);
	}

	findOne(id) {
		return knex('clinics')
			.where('id', id)
			.first();
	}

	deleteClinic({ id }) {
		return Promise.all([
			knex('clinics')
				.where('id', id)
				.delete(),
			knex('users')
				.where('clinic_id', id)
				.delete()
		]);
	}
}
