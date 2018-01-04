/* eslint-disable no-param-reassign,camelcase */
import pwd from 'pwd';

import Clinics from '../clinics';
import { clinic as defaultClinic } from '../../../helpers/constants/general';

export default async function createUser(knex, { password, first_name = '', last_name = '', ...fields }) {
  const clinics = new Clinics();
  const clinic = { ...defaultClinic };

  clinic.name = `${first_name} ${last_name}`;

  if ('files' in fields) {
    fields.files = JSON.stringify(fields.files);
  }
  if ('related_persons' in fields) {
    fields.related_persons = JSON.stringify(fields.related_persons);
  }
  let clinicResult = null;

  try {
    if (fields.login !== 'admin') {
      clinicResult = await clinics.addClinic(clinic);
    }
  } catch (exc) {
    return Promise.reject(exc);
  }

  if (clinicResult) {
    const [clinicId] = clinicResult;
    fields.clinic_id = clinicId;
  }
  if (password) {
    const { salt, hash } = await pwd.hash(password);
    return knex('users').insert({
      ...fields,
      first_name,
      last_name,
      salt,
      hash,
    }).returning('*');
  }

  return knex('users').insert(fields).returning('*');
}
