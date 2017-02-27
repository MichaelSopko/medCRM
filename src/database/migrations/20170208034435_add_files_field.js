export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			// table.specificType('files', 'JSON');
			table.text('files');
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('files');
		}),
	]);
}