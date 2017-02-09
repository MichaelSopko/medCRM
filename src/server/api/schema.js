import { makeExecutableSchema, addErrorLoggingToSchema } from 'graphql-tools'
import { PubSub } from 'graphql-subscriptions'
import ROLES from '../../helpers/constants/roles'
import checkAccessLogic from '../../helpers/checkAccessLogic'
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import GraphQLJSON from 'graphql-type-json';
import CustomGraphQLDateType from 'graphql-custom-datetype';
import GraphQLMomentMySQL from './GraphQLMomentMySQL';

import log from '../../log'
import schema from './schema_def.graphqls'

export const pubsub = new PubSub();

async function checkAccess(ctx, role) {
	const user = await ctx.Users.findOne(ctx.currentUser.id);
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
		treatmentSeries(ignored1, { clinic_id }, context) {
			return context.Treatments.getSeries(clinic_id);
		},
		currentUser(ignored1, ignored2, context) {
			return context.Users.findOne(context.currentUser.id);
		}
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

		addPatient(_, { clinic_id, patient }, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.createUser({
					clinic_id,
					...patient,
					role: ROLES.PATIENT
				}))
				.then(res => ({ status: res }))
		},
		editPatient(_, { id, patient }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Users.editUser({
					id,
					...patient
				}))
				.then(res => ({ status: res }))
		},
		deletePatient(_, { id }, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.deleteUser({ id }))
				.then(res => ({ status: res }))
		},

		addTreatmentSeries(_, series, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.addSeries(series))
				.then(res => ({ status: res }))
		},
		editTreatmentSeries(_, series, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.editSeries(series))
				.then(res => ({ status: res }))
		},
		deleteTreatmentSeries(_, { id }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.deleteSeries({ id }))
				.then(res => ({ status: res }))
		},

		addTreatment(_, { series_id, treatment }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.addTreatment({ series_id, ...treatment }))
				.then(res => ({ status: res }))
		},
		editTreatment(_, { id, treatment }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.editTreatment({
					id,
					...treatment
				}))
				.then(res => ({ status: res }))
		},
		deleteTreatment(_, { id }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.deleteTreatment({ id }))
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
	TreatmentSeries: {
		treatments(series, _, context) {
			return context.Treatments.getTreatments(series.id);
		}
	},
	Treatment: {
		therapists(treatment, _, context) {
			const ids = JSON.parse(treatment.therapist_ids);
			return context.Users.getUsers(ids);
		},
		patients(treatment, _, context) {
			const ids = JSON.parse(treatment.patient_ids);
			return context.Users.getUsers(ids);
		}
	},
	Date: GraphQLMomentMySQL
};

const executableSchema = makeExecutableSchema({
	typeDefs: schema,
	resolvers,
});

addErrorLoggingToSchema(executableSchema, { log: (e) => log.error(e) });

export default executableSchema;
