export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.string('title').default('value1');
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('title');
		}),
	]);
}