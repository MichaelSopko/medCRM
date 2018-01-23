import Knex from 'knex';
import objection from 'objection';
import { development, production } from '../../../knexfile'; // eslint-disable-line

import SoftDeleteQueryBuilder from './helpers/SoftDeleteQueryBuilder';
// import/named

const knex = Knex(__DEV__ ? development : production);

const Model = objection.Model;
Model.QueryBuilder = SoftDeleteQueryBuilder;
Model.RelatedQueryBuilder = SoftDeleteQueryBuilder;
Model.knex(knex);

export { knex as default, Model };

// export default knex(config);
