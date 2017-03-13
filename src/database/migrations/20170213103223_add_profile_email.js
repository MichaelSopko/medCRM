export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.string('profile_email');
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('profile_email');
		}),
	]);
}