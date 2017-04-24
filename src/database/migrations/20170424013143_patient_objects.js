export function up(knex, Promise) {
	return knex.transaction(trx => trx
		.schema.createTable('patient_objects', (table) => {
			table.increments();
			table.enum('type', ['DIAGNOSE','TREATMENT_SUMMARY'])
			table.integer('patient_id').unsigned().references('id').inTable('users');
			table.dateTime('date');
			table.integer('patient_age').unsigned();
			// table.specificType('fillers_ids', 'json');
			table.string('fillers_ids');
			table.text('hearing_test_remark');
			table.date('hearing_test_date');
			// table.specificType('fields', 'json');
			table.text('fields');
		})
	);
}

export function down() {

}