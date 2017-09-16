import knex, { Model } from '../connector';

export default class Clinic extends Model {
	static tableName = 'clinics';


	async $beforeDelete(queryContext) {
		console.log(queryContext);
		const id = queryContext;
		return Promise.all([
			knex('treatment_series').where('clinic_id', id).select(),
			knex('users').where('clinic_id', id).delete(),
		]).then(([ts]) => {
			return knex('treatments').whereIn('id', ts.map(t => t.id)).delete().then(() => {
				return knex('treatment_series').where('clinic_id', id).delete();
			}).then(() => {
				return knex('clinics').where('id', id).delete();
			});
		});
	}

}
