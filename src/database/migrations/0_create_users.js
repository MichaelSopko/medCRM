import ROLES from '../../helpers/constants/roles';

export function up(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('users', (table) => {
			table.increments();
			table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
			table.timestamp('updated_at').notNullable();
			table.string('login').unique();
			table.string('hash');
			table.string('salt');
			table.string('name');
			table.enum('role', Object.keys(ROLES));
		}),
	]).then(() => {
		return knex.schema.createTable('auth_tokens', (table) => {
			table.increments();
			table.timestamps();
			table.integer('user_id').unsigned().references('id').inTable('users');
			table.string('token').notNull();
		})
	});
}

export function down(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('auth_tokens'),
		knex.schema.dropTable('users'),
	]);
}
