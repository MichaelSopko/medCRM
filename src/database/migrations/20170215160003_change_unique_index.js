export function up(knex, Promise) {
	return Promise.all([
		knex.schema.alterTable('users', (table) => {
			table.dropUnique('id_number');
			table.unique(['id_number', 'clinic_id'])
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.unique('id_number');
			table.dropUnique(['id_number', 'clinic_id'])
		}),
	]);
}