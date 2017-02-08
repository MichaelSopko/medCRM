export function up(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('treatment_series', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.timestamp('updated_at').notNullable();
			table.integer('clinic_id').unsigned().references('id').inTable('clinics');
			table.string('name');
			table.integer('treatments_number').unsigned();
		}),
	]).then(() => {
		return Promise.all([knex.schema.createTable('treatments', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.timestamp('updated_at').notNullable();
			table.integer('series_id').unsigned().references('id').inTable('treatment_series');
			table.string('target');
			table.string('method');
			table.string('process');
			table.string('parents_guidance');
			table.string('next_treatment_remark');
			table.dateTime('date');
			//table.specificType('therapist_ids', 'JSON');
			table.string('therapist_ids');
			//table.specificType('patient_ids', 'JSON');
			table.string('patient_ids');
		})])
	})
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('treatment_series'),
		knex.schema.dropTable('treatments'),
	]);
}
