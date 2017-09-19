import knex, { Model } from '../connector';

export const TABLE_NAME = 'treatments_objects';

const baseTypes = {
	id: { type: 'integer' },
	date: { type: 'date' },
	fields: { type: 'object' },
};

export class SchoolObservation extends Model {
	static tableName = TABLE_NAME;

	static jsonSchema = {
		type: 'object',
		properties: {
			...baseTypes,
		},
	};

}

export class StaffMeeting extends Model {
	static tableName = TABLE_NAME;
	static jsonSchema = {
		type: 'object',
		properties: {
			...baseTypes,
		},
	};
}

export class OutsideSourceConsult extends Model {
	static tableName = TABLE_NAME;
	static jsonSchema = {
		type: 'object',
		properties: {
			...baseTypes,
		},
	};
}
