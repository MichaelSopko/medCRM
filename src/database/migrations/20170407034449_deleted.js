export function up(knex, Promise) {
	return Promise.all([
		knex.schema.alterTable('treatments', (table) => {
			table.boolean('deleted').defaultTo(0);
		}),
		knex.schema.alterTable('treatment_series', (table) => {
			table.boolean('deleted').defaultTo(0);
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
	]);
}