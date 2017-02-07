const initialAmount = 5;
import ROLES from '../../helpers/constants/roles';
import createUser from '../../server/sql/helpers/create_user';

export function seed(knex, Promise) { // eslint-disable-line import/prefer-default-export
  return Promise.all([
    knex('users').del(),
    knex('clinics').del(),
  ])
  .then(() => {
    return Promise.all([
      createUser(knex, { login: 'admin', password: '1234', first_name: 'First', last_name: 'Last', role: ROLES.SYSTEM_ADMIN }),
      knex('clinics').insert({ name: 'Central Los Santos Medical Center', address: 'Davis Avenue' }),
    ]);
  });
}
