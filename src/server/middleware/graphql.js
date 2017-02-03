import { graphqlExpress } from 'graphql-server-express';
import 'isomorphic-fetch';

import schema from '../api/schema';
import Count from '../sql/count';
import Clinics from '../sql/clinics';
import Users from '../sql/users';

export default graphqlExpress((req, res) => {
  return {
    schema,
    context: {
      Count: new Count(),
      Clinics: new Clinics(),
      Users: new Users(),
      currentUser: req.user.user
    },
  };
});