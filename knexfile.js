const isBabel = !(class {
}.toString().indexOf('class ') === 0);
if (!isBabel) {
	require('babel-register');
}

module.exports = {
	development: {
		client: 'mysql',
		connection: {
			host: '127.0.0.1',
			user: 'root',
			password: '',
			database: 'clinic-app'
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
		connection: {
			host: '127.0.0.1',
			user: 'clinic-app',
			password: 'SUPER_SECURE_PASS',
			database: 'clinic-app'
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
