export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			// table.specificType('related_persons', 'JSON');
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