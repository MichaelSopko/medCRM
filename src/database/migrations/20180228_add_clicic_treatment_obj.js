export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('treatments_objects', (table) => {
			table.integer('clinic_id').unsigned().references('id').inTable('clinics');
		}),
	]);
}

export function down() {

}
