import { makeExecutableSchema } from 'graphql-tools';
import { merge, omit } from 'lodash';

export default (modules, ...options) => {
	const typeDefs = modules.map(module => module.schema);
	const resolvers = merge(...modules.map(module => omit(module, 'schema')));

	return makeExecutableSchema({
		typeDefs,
		resolvers,
		...options,
	});
};
