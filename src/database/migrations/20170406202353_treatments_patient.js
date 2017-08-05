export function up(knex, Promise) {
	return knex.transaction(trx => trx
		.schema.table('users', (table) => {
			table.specificType('diagnoses', 'JSON');
			table.specificType('treatment_summary', 'JSON');
			// table.text('diagnoses');
			// table.text('treatment_summary');
			table.boolean('disabled').defaultTo(0);
			table.boolean('archived').index().defaultTo(0);
			table.dateTime('archived_date');
		})
		.table('clinics', (table) => {
			table.integer('treatment_duration').unsigned().defaultTo(60);
			table.integer('patients_limit').unsigned().defaultTo(100);
			table.integer('archive_time').unsigned().defaultTo(60);
			table.boolean('disabled').defaultTo(0);
			table.boolean('deleted').index().defaultTo(0);
		})
		.table('treatment_series', (table) => {
			table.integer('patient_id').unsigned().references('id').inTable('users');
		})
		.table('treatments', (table) => {
			table.dropColumn('date');
			table.dropColumn('patient_ids');
			table.dateTime('start_date');
			table.dateTime('end_date');
		}),
	);
}

export function down() {

}
