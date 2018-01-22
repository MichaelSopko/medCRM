import knex, { Model } from '../connector';

export default class Treatment extends Model {
	static tableName = 'treatments';

	async $beforeInsert(queryContext) {
		console.dir(queryContext);
		await knex('treatments')
			.where(function () {
				if (id) this.whereNot('id', id);
				this.whereNot('deleted', true);
				this.whereBetween('start_date', [start_date, end_date]);
			})
			.orWhere(function () {
				if (id) this.whereNot('id', id);
				this.whereNot('deleted', true);
				this.whereBetween('end_date', [start_date, end_date]);
			})
			.count();
		return res[0]['count(*)'];
	}

}
