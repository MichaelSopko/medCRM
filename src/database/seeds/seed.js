import ROLES from '../../helpers/constants/roles';
import createUser from '../../server/sql/helpers/create_user';

export function seed(knex, Promise) { // eslint-disable-line import/prefer-default-export
	return knex('users').select().then(res => {
		if (res.length > 1) return;

		return Promise.all([
			knex('clinics').del(),
			knex('users').del(),
		])
			.then(() => {
				return Promise.all([
					createUser(knex, {
						login: 'admin',
						password: process.env.ADMIN_PASSWORD || '1234',
						role: ROLES.SYSTEM_ADMIN
					}),
					knex('clinics').insert({ name: 'Central Los Santos Medical Center', address: 'Davis Avenue' }),
				]);
			});
	});
}
