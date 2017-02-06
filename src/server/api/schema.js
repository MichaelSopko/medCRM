import { makeExecutableSchema, addErrorLoggingToSchema } from 'graphql-tools'
import { PubSub } from 'graphql-subscriptions'
import ROLES from '../../helpers/constants/roles'
import checkAccessLogic from '../../helpers/checkAccessLogic'
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import GraphQLJSON from 'graphql-type-json';

import log from '../../log'
import schema from './schema_def.graphqls'

export const pubsub = new PubSub();

async function checkAccess(ctx, role) {
	const user = await ctx.Users.getUser({ id: ctx.currentUser.id });
	const isOk = checkAccessLogic(user.role, role);
	if (isOk) {
		return user;
	} else {
		throw new Error('No access');
	}
}

const resolvers = {
	Query: {
		clinics(ignored1, ignored2, context) {
			return checkAccess(context)
				.then(() => context.Clinics.getClinics());
		},
		administrators(ignored1, ignored2, context) {
			return context.Users.findByRole(ROLES.CLINIC_ADMIN);
		},
		therapists(ignored1, { clinic_id }, context) {
			return context.Users.findByRole(ROLES.THERAPIST, clinic_id);
		},
		patients(ignored1, { clinic_id }, context) {
			return context.Users.findByRole(ROLES.PATIENT, clinic_id);
		},
		currentUser(ignored1, ignored2, context) {
			return context.Users.getUser({ id: context.currentUser.id });
		},
	},
	Mutation: {
		addClinic(_, clinic, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Clinics.addClinic(clinic))
				.then(res => ({ status: res }))
		},
		editClinic(_, clinic, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Clinics.editClinic(clinic))
				.then(res => ({ status: res }))
		},
		deleteClinic(_, { id }, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Clinics.deleteClinic({ id }))
				.then(res => ({ status: res }))
		},

		addAdministrator(_, user, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Users.createUser({ ...user, role: ROLES.CLINIC_ADMIN }))
				.then(res => ({ status: res }))
		},
		editAdministrator(_, user, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Users.editUser(user))
				.then(res => ({ status: res }))
		},
		deleteAdministrator(_, { id }, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Users.deleteUser({ id }))
				.then(res => ({ status: res }))
		},

		addTherapist(_, user, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.createUser({ ...user, role: ROLES.THERAPIST }))
				.then(res => ({ status: res }))
		},
		editTherapist(_, user, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.editUser(user))
				.then(res => ({ status: res }))
		},
		deleteTherapist(_, { id }, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.deleteUser({ id }))
				.then(res => ({ status: res }))
		},

		addPatient(_, user, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.createUser({ ...user, role: ROLES.PATIENT }))
				.then(res => ({ status: res }))
		},
		editPatient(_, user, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Users.editUser(user))
				.then(res => ({ status: res }))
		},
		deletePatient(_, { id }, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.deleteUser({ id }))
				.then(res => ({ status: res }))
		},
	},
	Subscription: {  // Here live subscriptions can be added
		clinicUpdated(ids) {
		}
	},
	ClinicAdministrator: {
		clinic(user, _, context) {
			return context.Clinics.findOne(user.clinic_id);
		}
	},
	Therapist: {
		clinic(user, _, context) {
			return context.Clinics.findOne(user.clinic_id);
		}
	},
	CurrentUser: {
		clinic(user, _, context) {
			return context.Clinics.findOne(user.clinic_id);
		}
	},
	Date: GraphQLJSON
};

const executableSchema = makeExecutableSchema({
	typeDefs: schema,
	resolvers,
});

addErrorLoggingToSchema(executableSchema, { log: (e) => log.error(e) });

export default executableSchema;
