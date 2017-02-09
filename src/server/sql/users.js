import knex from './connector';
import pwd from 'pwd';

import createUser from './helpers/create_user';


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
	}

	getUsers(ids) {
		return knex('users')
			.whereIn('id', ids)
			.select();
	}

	async editUser({ id, password, ...fields }) {
		if ('files' in fields) {
			fields.files = JSON.stringify(fields.files);
		}
		if ('related_persons' in fields) {
			fields.related_persons = JSON.stringify(fields.related_persons);
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
			.delete()
	}

	findByRole(role, clinic_id) {
		let k = knex('users').where('role', role);
		if (clinic_id) {
			k = k.andWhere('clinic_id', clinic_id);
		}
		return k.select()
			.then(users => users.map(user => ({
				...user,
				files: JSON.parse(user.files),
				related_persons: JSON.parse(user.related_persons),
			})));
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