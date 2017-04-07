export function up(knex, Promise) {
	return knex.transaction(trx => Promise.all([
		trx.schema.table('users', (table) => {
			// table.specificType('diagnoses', 'JSON');
			// table.specificType('treatment_summary', 'JSON');
			table.text('diagnoses');
			table.text('treatment_summary');
			table.boolean('disabled').defaultTo(false);
			table.boolean('archived').index().defaultTo(false);
			table.dateTime('archived_date');
		}),
		trx.schema.table('clinics', (table) => {
			table.integer('treatment_duration').unsigned().defaultTo(60);
			table.integer('patients_limit').unsigned().defaultTo(100);
			table.integer('archive_time').unsigned().defaultTo(60);
			table.boolean('disabled').defaultTo(false);
			table.boolean('deleted').index().defaultTo(false);
		}),
		trx.schema.table('treatment_series', (table) => {
			table.integer('patient_id').unsigned().references('id').inTable('users');
		}),
		trx.schema.table('treatments', (table) => {
			table.dropColumn('data');
			table.dropColumn('patient_ids');
			table.dateTime('start_date');
			table.dateTime('end_date');
		}),
	]));
}

export function down() {

}
