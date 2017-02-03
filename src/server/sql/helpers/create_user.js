import pwd from 'pwd';

export default async function createUser(knex, { login, password, name, role }) {
	const { salt, hash } = await pwd.hash(password);
	return knex('users').insert({
		login,
		name,
		role,
		salt,
		hash
	});
}