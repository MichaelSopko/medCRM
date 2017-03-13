export function up(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('clinics', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.timestamp('updated_at').notNullable();
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
