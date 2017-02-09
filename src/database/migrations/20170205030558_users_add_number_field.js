export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.bigInteger('id_number').unique().unsigned();
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('id_number');
		}),
	]);
}