import ROLES from '../../helpers/constants/roles';

export function up(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('treatment_series', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
			table.integer('clinic_id').unsigned().references('id').inTable('clinics');
			table.string('name');
		}),
	]).then(() => {
		return Promise.all([knex.schema.createTable('treatments', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
			table.integer('series_id').unsigned().references('id').inTable('treatment_series');
			table.string('token').notNull();
			table.string('target');
			table.string('method');
			table.string('process');
			table.string('parents_guidance');
			table.string('next_treatment_remark');
			table.dateTime('date');
		})])
			.then(() => {
				return Promise.all([
					knex.schema.createTable('treatments_therapists_relations', (table) => {
						table.integer('treatment_id').unsigned().references('id').inTable('treatments');
						table.integer('therapist_id').unsigned().references('id').inTable('users');
					}),
					knex.schema.createTable('treatments_patients_relations', (table) => {
						table.integer('treatment_id').unsigned().references('id').inTable('treatments');
						table.integer('patient_id').unsigned().references('id').inTable('users');
					})
				]);
			});
	})
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('treatment_series'),
		knex.schema.dropTable('treatments'),
		knex.schema.dropTable('treatments_therapists_relations'),
		knex.schema.dropTable('treatments_patients_relations'),
	]);
}
