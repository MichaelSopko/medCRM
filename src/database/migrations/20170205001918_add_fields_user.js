import health_maintenances from '../../helpers/constants/health_maintenances'

export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.dropColumn('name');
			table.integer('clinic_id').unsigned().references('id').inTable('clinics');
			table.string('first_name');
			table.string('last_name');
			table.date('birth_date');
			table.string('phone');
			table.string('email').unique();
			table.bigInteger('license_number').unsigned();
			table.enum('health_maintenance', Object.keys(health_maintenances));
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', (table) => {
			table.string('name');
			table.dropColumn('first_name');
			table.dropColumn('last_name');
			table.dropColumn('birth_date');
			table.dropColumn('phone');
			table.dropColumn('email');
			table.dropColumn('license_number');
			table.dropColumn('health_maintenance');
		}),
	]);
}