import { graphqlExpress } from 'graphql-server-express';
import 'isomorphic-fetch';

import schema from '../api/schema';
import Clinics from '../sql/clinics';
import Users from '../sql/users';

export default graphqlExpress((req, res) => {
  return {
    schema,
    context: {
      Clinics: new Clinics(),
      Users: new Users(),
      currentUser: req.user ? req.user.user : {}
    },
  };
});