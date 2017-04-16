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
		if ('files' in fields) {
			fields.files = JSON.stringify(fields.files);
		}
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