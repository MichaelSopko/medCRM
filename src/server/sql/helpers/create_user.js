import pwd from 'pwd';
import moment from 'moment';

export default async function createUser(knex, { password, ...fields }) {
	if ('birth_date' in fields) {
		fields.birth_date = moment(fields.birth_date).format('YYYY-MM-DD HH:mm:ss');
	}
	if (password) {
		const { salt, hash } = await pwd.hash(password);
		return knex('users').insert({
			...fields,
			salt,
			hash
		});
	} else {
		return knex('users').insert(fields);
	}
}