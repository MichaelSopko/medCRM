import knex from './connector';

export default class Clinics {
  getClinics() {
    return knex('clinics').where('deleted', false).select();
  }

  addClinic(fields) {
    return knex('clinics')
      .insert(fields)
      .returning('*');
  }

  editClinic(id, fields) {
    return knex('clinics')
      .where('id', id)
      .update(fields);
  }

  findOne(id) {
    return knex('clinics')
      .where('id', id)
      .first();
  }

  deleteClinic({ id }) {
    return Promise.all([
      knex('treatment_series').where('clinic_id', id).select(),
      knex('users').where('clinic_id', id).delete(),
    ]).then(([ts]) => knex('treatments').whereIn('id', ts.map(t => t.id)).delete().then(() => knex('treatment_series').where('clinic_id', id).delete()).then(() => knex('clinics').where('id', id).delete()));
  }
}
