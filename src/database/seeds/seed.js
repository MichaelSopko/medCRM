const initialAmount = 5;
import ROLES from '../../helpers/roles';
import createUser from '../../server/sql/helpers/create_user';

export function seed(knex, Promise) { // eslint-disable-line import/prefer-default-export
  return Promise.all([
    knex('count').del(),
    knex('users').del(),
    knex('clinics').del(),
  ])
  .then(() => {
    return Promise.all([
      knex('count').insert({ amount: initialAmount }),
      createUser(knex, { login: 'admin', password: '1234', name: 'First Last', role: ROLES.SYSTEM_ADMIN }),
      knex('clinics').insert({ name: 'Central Los Santos Medical Center', address: 'Davis Avenue' }),
    ]);
  });
}
