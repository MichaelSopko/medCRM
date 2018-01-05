/* eslint-disable no-param-reassign,camelcase */
import pwd from 'pwd';

export default async function createUser(knex, { password, ...fields }) {
  if ('files' in fields) {
    fields.files = JSON.stringify(fields.files);
  }
  if ('related_persons' in fields) {
    fields.related_persons = JSON.stringify(fields.related_persons);
  }
  if (password) {
    const { salt, hash } = await pwd.hash(password);
    return knex('users').insert({
      ...fields,
      salt,
      hash,
    }).returning('*');
  }

  return knex('users').insert(fields).returning('*');
}
