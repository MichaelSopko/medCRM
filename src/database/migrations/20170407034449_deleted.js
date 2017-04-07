export function up(knex, Promise) {
	return Promise.all([
		knex.schema.alterTable('treatments', (table) => {
			table.boolean('deleted').defaultTo(false);
		}),
		knex.schema.alterTable('treatment_series', (table) => {
			table.boolean('deleted').defaultTo(false);
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
	]);
}