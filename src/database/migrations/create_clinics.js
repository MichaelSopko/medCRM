export function up(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('clinics', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
			table.timestamp('updated_at');
			table.string('name').index();
			table.string('address')
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('clinics'),
	]);
}
