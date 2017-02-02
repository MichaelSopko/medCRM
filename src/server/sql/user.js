import knex from './connector'

export default class User {
  createUser({ login, password, name, type }) {
    return knex('users').insert({
      login,
      password,
      name,
      type
    });
  }

  addCount(amount) {
    return knex('user')
      .increment('amount', amount);
  }
}
