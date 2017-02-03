import { makeExecutableSchema, addErrorLoggingToSchema } from 'graphql-tools'
import { PubSub } from 'graphql-subscriptions'

import log from '../../log'
import schema from './schema_def.graphqls'
import ROLES from '../../helpers/roles';

export const pubsub = new PubSub();

async function checkPermissions(ctx, ...roles) {
	const user = await ctx.Users.getUser({ id: ctx.currentUser.id });
	if (roles.some(role => role === user.role)) {
		return true;
	} else {
		throw new Error('No access');
	}
}

const resolvers = {
	Query: {
		clinics(ignored1, ignored2, context) {
			return context.Clinics.getClinics();
		},
		currentUser(ignored1, ignored2, context) {
			return context.Users.getUserSafe({ id: context.currentUser.id });
		},
	},
	Mutation: {
		addClinic(_, { name, address }, context) {
			return checkPermissions(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Clinics.addClinic({ name, address }))
				.then(res => ({ status: res }))
		},
		editClinic(_, { id, name, address }, context) {
			return checkPermissions(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Clinics.editClinic({ id, name, address }))
				.then(res => ({ status: res }))
		},
		deleteClinic(_, { id }, context) {
			return checkPermissions(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Clinics.deleteClinic({ id }))
				.then(res => ({ status: res }))
		},
	},
	Subscription: {  // Here live subscriptions can be added
		clinicUpdated(ids) { }
	}
};

const executableSchema = makeExecutableSchema({
	typeDefs: schema,
	resolvers,
});

addErrorLoggingToSchema(executableSchema, { log: (e) => log.error(e) });

export default executableSchema;
