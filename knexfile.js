const isBabel = !(class {
}.toString().indexOf('class ') === 0);
if (!isBabel) {
  require('babel-register');
}

require('dotenv').config();

module.exports = {
	development: {
		client: 'mysql',
		connection: {
			host: '127.0.0.1',
			user: 'root',
			password: '123456',
			database: 'clinic-prod'
		},
		seeds: {
			directory: './src/database/seeds'
		},
		migrations: {
			directory: './src/database/migrations'
		},
		useNullAsDefault: true
	},
	production: {
		client: 'mysql',
		connection: process.env.CLEARDB_DATABASE_URL || process.env.DATABASE_URL || {
			host: process.env.DATABASE_HOST || '127.0.0.1',
			user:'root',
			password:  '123456',
			database: 'clinic-prod'
		},
		seeds: {
			directory: './src/database/seeds'
		},
		migrations: {
			directory: './src/database/migrations'
		},
		useNullAsDefault: true
	},


};
