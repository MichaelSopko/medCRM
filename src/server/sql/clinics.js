import knex from './connector'

export default class Clinics {
  getClinics() {
    return knex('clinics').select();
  }

  addClinic({ name, address }) {
    return knex('clinics')
      .insert({ name, address });
  }

  editClinic({ id, name, address }) {
    return knex('clinics')
      .where('id', id)
      .update({ name, address });
  }

  deleteClinic({ id }) {
    return knex('clinics')
      .where('id', id)
      .delete();
  }
}
