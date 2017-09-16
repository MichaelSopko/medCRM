import { graphqlExpress } from 'graphql-server-express';
import 'isomorphic-fetch';
import { formatError } from 'apollo-errors';

import schema from '../graphql/schema';
import Clinic from '../sql/models/Clinic';
import Users from '../sql/models/users';
import Treatments from '../sql/models/treatments';

export default graphqlExpress(async (req, res) => {
	let currentUser = null;
	if (req.user && req.user.user) {
		currentUser = await new Users().findOne(req.user.user.id);
	}

  return {
    schema,
	  formatError,
    context: {
      Clinic,
      Users: new Users(),
	    Treatments: new Treatments(),
      currentUser,
    },
  };
});
