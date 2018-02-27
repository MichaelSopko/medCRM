import knex, { Model } from '../connector';

class TreatmentObject extends Model {
	// static tableName = 'treatments_objects';
	//
	// static jsonSchema = {
	// 	type: 'object',
	// 	properties: {
	// 		date: { type: 'date' },
	// 		fields: { type: 'object' },
	// 	},
	// };

}

TreatmentObject.tableName = 'treatments_objects';
TreatmentObject.jsonSchema = {
	type: 'object',
	properties: {
		date: { type: 'date' },
		fields: { type: 'object' },
	},
};

export default TreatmentObject;
