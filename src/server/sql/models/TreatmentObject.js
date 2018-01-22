import knex, { Model } from '../connector';

export default class TreatmentObject extends Model {
	static tableName = 'treatments_objects';

	static jsonSchema = {
		type: 'object',
		properties: {
			date: { type: 'date' },
			fields: { type: 'object' },
		},
	};

}
