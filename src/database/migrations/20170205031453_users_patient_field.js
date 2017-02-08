export function up(knex, Promise) {
	return Promise.all([
		// knex.schema.raw('ALTER TABLE users ADD related_persons JSON;') // because knex doesn't support mysql json type yet

		knex.schema.table('users', (table) => {
			table.string('related_persons');
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('related_persons');
		}),
	]);
}