export function up(knex, Promise) {
	return knex.transaction(trx => trx
		.schema.table('users', (table) => {
			table.enum('gender', ['MALE','FEMALE']).notNullable().defaultTo('MALE');
		})
	);
}

export function down() {

}