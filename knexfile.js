const isBabel = !(class {
}.toString().indexOf('class ') === 0);
if (!isBabel) {
	require('babel-register');
}

module.exports = {
	development: {
		client: 'mysql',
		connection: process.env.CLEARDB_DATABASE_URL || process.env.DATABASE_URL || {
			host: process.env.DATABASE_HOST || '127.0.0.1',
			user: process.env.DATABASE_USER || 'root',
			password: process.env.DATABASE_PASSWORD || '',
			database: process.env.DATABASE_NAME || 'clinic-prod',
			insecureAuth: true,
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
			user: process.env.DATABASE_USER || 'root',
			password: process.env.DATABASE_PASSWORD || '',
			database: process.env.DATABASE_NAME || 'clinic-prod',
			insecureAuth: true,
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
