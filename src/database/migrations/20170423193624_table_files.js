export function up(knex, Promise) {
	return knex.transaction(trx => trx
		.schema.table('users', (table) => {
			table.dropColumn('files');
		})
		.createTable('files', (table) => {
			table.increments();
			table.integer('patient_id').unsigned().references('id').inTable('users');
			table.string('name').defaultTo('unnamed').notNullable();
			table.integer('size').unsigned();
			table.string('type').notNullable();
			table.string('url').notNullable();
		})
	);
}

export function down() {

}