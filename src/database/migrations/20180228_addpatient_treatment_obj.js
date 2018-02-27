export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('treatments_objects', (table) => {
			table.integer('patient_id').unsigned().references('id').inTable('users');
		}),
	]);
}

export function down() {

}
