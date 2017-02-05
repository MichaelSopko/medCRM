export function up(knex, Promise) {
	return Promise.all([
		knex.schema.table('clinics', (table) => {
			table.string('phone');
			table.string('fax');
			table.string('email');
		}),
	]);
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.table('clinics', (table) => {
			table.dropColumn('phone');
			table.dropColumn('fax');
			table.dropColumn('email');
		}),
	]);
}