export function up(knex, Promise) {
	return knex.transaction(trx => trx
		.schema.createTable('treatments_objects', (table) => {
			table.increments();
			table.integer('series_id').unsigned().references('id').inTable('treatment_series');
			table.dateTime('date');
			table.specificType('fields', 'json');
			table.boolean('deleted').defaultTo(0);
		}),
	);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('treatments_objects'),
	]);
}
