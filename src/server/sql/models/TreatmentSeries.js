import knex, { Model } from '../connector';

export default class TreatmentSeries extends Model {
	static tableName = 'treatment_series';
}
