import { graphql } from 'react-apollo';

import GET_THERAPISTS_QUERY from '../ui/graphql/TherapistsGet.graphql';

export default graphql(GET_THERAPISTS_QUERY, {
	alias: 'withTherapists',
	props: ({ ownProps, data }) => ({
		therapists: (data && data.therapists) ? data.therapists : [],
		therapistsLoading: data && data.loading,
	}),
	options: ({ currentClinic }) => ({
		variables: { clinic_id: currentClinic.id }
	})
});