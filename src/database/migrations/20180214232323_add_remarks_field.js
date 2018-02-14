export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.string('remarks');
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('remarks');
		}),
	]);
}