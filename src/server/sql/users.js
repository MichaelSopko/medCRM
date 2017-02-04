import knex from './connector';
import pwd from 'pwd';

import createUser from './helpers/create_user';

export default class Users {

	static safeFields = ['id', 'login', 'name', 'role'];

	async createUser(...params) {
		return createUser(knex, ...params);
	}

	getUser({ id, login }) {
		const clause = id ? ['id', id] : ['login', login];
		return knex('users')
			.where(...clause)
			.first()
	}

	getUserSafe({ id }) {
		return knex('users')
			.where('id', id)
			.first(...Users.safeFields)
	}

	findByRole(role) {
		return knex('users')
			.where('role', role)
			.select(...Users.safeFields)
	}

	async checkPassword({ login, password }) {
		const user = await knex('users').where('login', login).first();
		if (user) {
			const result = await pwd.hash(password, user.salt);
			return user.hash === result.hash;
		} else {
			return false;
		}
	}
}