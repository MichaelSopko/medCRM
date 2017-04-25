import knex from './connector'
import pwd from 'pwd'

import log from '../../log'
import createUser from './helpers/create_user'

const safeParse = (json, deflt = []) => {
	try {
		if (json == null) {
			return deflt;
		}
		return JSON.parse(json || `${deflt}`)
	} catch (e) {
		log('JSON parse error', json, e);
		return deflt;
	}
}

export default class Users {

	async createUser(...params) {
		return createUser(knex, ...params);
	}

	findOne(id) {
		return knex('users')
			.where('id', id)
			.first()
	}

	getByLogin(login) {
		if (!login) return false;
		return knex('users')
			.orWhere('login', login)
			.orWhere('email', login)
			.first()
			.then(async user => {
				if (user.clinic_id) {
					return {
						...user,
						clinic: await knex('clinics').where('id', user.clinic_id).first()
					};
				} else {
					return user;
				}
			})
	}

	getUsers(ids) {
		return knex('users')
			.whereIn('id', ids)
			.andWhere('archived', false)
			.select();
	}

	async editUser({ id, password, ...fields }) {
		if ('related_persons' in fields) {
			fields.related_persons = JSON.stringify(fields.related_persons);
		}
		if ('diagnoses' in fields) {
			fields.diagnoses = JSON.stringify(fields.diagnoses);
		}
		if ('treatment_summary' in fields) {
			fields.treatment_summary = JSON.stringify(fields.treatment_summary);
		}
		if (password) {
			const { salt, hash } = await pwd.hash(password);
			fields = {
				...fields,
				salt,
				hash
			};
		}
		return knex('users')
			.where('id', id)
			.update(fields)
	}

	deleteUser({ id }) {
		return knex('users')
			.where('id', id)
			.update('archived', true)
			// .delete()
	}

	addPatientFile(file) {
		return knex('files')
			.insert(file, '*')
			.then(([row]) => row); // return inserted id
	}

	getPatientFile(id) {
		return knex('files')
			.where('id', id)
			.first()
	}

	deletePatientFile(id) {
		return knex('files')
			.where('id', id)
			.del()
			.then(() => id);
	}

	getPatientFiles(patient_id) {
		return knex('files')
			.where('patient_id', patient_id)
			.orderBy('id', 'DESC')
			.select();
	}

	getDiagnoses(patient_id) {
		return knex('patient_objects')
			.where('patient_id', patient_id)
			.andWhere('type', 'DIAGNOSE')
			.select();
	}

	addDiagnose(diagnose) {
		if ('fields' in diagnose) {
			diagnose.fields = JSON.stringify(diagnose.fields);
		}
		return knex('patient_objects')
			.insert({ ...diagnose, type: 'DIAGNOSE' }, '*')
			.then(([row]) => row); // return inserted id
	}

	addTreatmentSummary(diagnose) {
		if ('fields' in diagnose) {
			diagnose.fields = JSON.stringify(diagnose.fields);
		}
		return knex('patient_objects')
			.insert({ ...diagnose, type: 'TREATMENT_SUMMARY' }, '*')
			.then(([row]) => row); // return inserted id
	}

	getTreatmentSummary(patient_id) {
		return knex('patient_objects')
			.where('patient_id', patient_id)
			.andWhere('type', 'TREATMENT_SUMMARY')
			.select();
	}

	findByRole(role, clinic_id, archived = false) {
		let k = knex('users')
			.where('role', role)
			.orderBy('id', 'desc');
		if (clinic_id) {
			k = k.andWhere('clinic_id', clinic_id);
		}
		return k
			.orderBy('id', 'DESC')
			.andWhere('archived', archived)
			.select();
	}

	async checkPassword({ login, password }) {
		const user = await knex('users')
			.orWhere('email', login)
			.orWhere('login', login)
			.first();
		if (user) {
			const result = await pwd.hash(password, user.salt);
			return user.hash === result.hash;
		} else {
			return false;
		}
	}
}