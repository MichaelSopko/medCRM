import pwd from 'pwd';

export default async function createUser(knex, { password, ...fields }) {
	const { salt, hash } = await pwd.hash(password);
	return knex('users').insert({
		...fields,
		salt,
		hash
	});
}