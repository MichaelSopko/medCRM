import ApolloClient, { IntrospectionFragmentMatcher } from 'apollo-client';
import TreatmentObjectTypes from './ui/treatment_series/graphql/TreatmentObjectTypes';

const createApolloClient = networkInterface => {
	const params = {
		dataIdFromObject: (result) => {
			if (result.id && result.__typename) { // eslint-disable-line no-underscore-dangle
				return result.__typename + result.id; // eslint-disable-line no-underscore-dangle
			}
			return null;
		},
		networkInterface,
		fragmentMatcher: new IntrospectionFragmentMatcher({
			introspectionQueryResultData: {
				__schema: {
					types: [
						TreatmentObjectTypes,
					],
				},
			},
		}),
	};
	return new ApolloClient(params);
};

export default createApolloClient;
