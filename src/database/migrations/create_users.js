export function up(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('users', (table) => {
			table.increments();
			table.timestamps();
			table.string('login');
			table.string('hash');
			table.string('name');
			table.enum('type', [
				'SYSTEM_ADMIN',
				'CLINIC_ADMIN',
				'THERAPIST',
				'PATIENT'
			]);
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('count'),
	]);
}
