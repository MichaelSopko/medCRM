import { graphql } from 'react-apollo';
import { propType } from 'graphql-anywhere';
import { } from 'react'; import PropTypes from 'prop-types';

import CURRENT_USER_QUERY from '../../graphql/CurrentUser.graphql';

export const withCurrentUser = graphql(
	CURRENT_USER_QUERY,
	{
		name: 'currentUser',
		alias: 'withCurrentUser',
	},
);

export const currentUserPropType = PropTypes.shape({
	loading: PropTypes.bool.isRequired,
	error: PropTypes.object,
	currentUser: propType(CURRENT_USER_QUERY),
});
