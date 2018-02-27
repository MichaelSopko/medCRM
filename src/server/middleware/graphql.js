import { graphqlExpress } from 'graphql-server-express';
import 'isomorphic-fetch';
import { formatError } from 'apollo-errors';

// import schema from '../graphql/schema';
import schema from '../api/schema';
import Clinics from '../sql/clinics';
import Users from '../sql/models/users';
import Treatments from '../sql/models/treatments';
import Clinic from '../sql/models/Clinic';
import Treatment from '../sql/models/Treatment';
import TreatmentSeries from '../sql/models/TreatmentSeries';
import TreatmentObject from '../sql/models/TreatmentObject';

// export default graphqlExpress(async (req, res) => {
// 	let currentUser = null;
// 	if (req.user && req.user.user) {
// 		currentUser = await new Users().findOne(req.user.user.id);
// 	}
//
//   return {
//     schema,
// 	  formatError,
//     context: {
//       Clinic: new Clinic(),
// 	    Treatment: new Treatment(),
// 	    TreatmentObject: new TreatmentObject(),
// 	    TreatmentSeries: new TreatmentSeries(),
//       Users: new Users(),
// 	    Treatments: new Treatments(),
//       currentUser,
//     },
//   };
// });

export default graphqlExpress((req, res) => ({
	schema,
	formatError,
	context: {
		Clinic,
		Treatment,
		TreatmentObject,
		TreatmentSeries,
		Clinics: new Clinics(),
		Users: new Users(),
		Treatments: new Treatments(),
		currentUser: req.user ? req.user.user : {},
	},
}));
