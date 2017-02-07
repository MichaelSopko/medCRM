import knex from './connector';
import pwd from 'pwd';

import createUser from './helpers/create_user';


export default class Users {

	async createUser(...params) {
		return createUser(knex, ...params);
	}

	getUser({ id, login }) {
		const clause = id ? ['id', id] : ['login', login];
		return knex('users')
			.where(...clause)
			.first()
	}

	// TODO: change password
	editUser({ id, password, ...fields }) {
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
	}

	async checkPassword({ login, password }) {
		const user = await knex('users')
			.where('login', login)
			.orWhere('email', login)
			.first();
		if (user) {
			const result = await pwd.hash(password, user.salt);
			return user.hash === result.hash;
		} else {
			return false;
		}
	}
}