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

const safeParse = (json, deflt = []) => {
	try {
		return JSON.parse(json || `${deflt}`)
	} catch (e) {
		log('JSON parse error');
		return deflt;
	}
}

async function checkAccess(ctx, role) {
	const user = await ctx.Users.findOne(ctx.currentUser.id);
	const isOk = checkAccessLogic(user.role, role);
	if (isOk) {
		return user;
	} else {
		throw new Error('No access');
	}
}

function checkForNonUniqueField(e) {
	if (e.code === 'ER_DUP_ENTRY') {
		if (e.message.indexOf('users_email_unique') !== -1) throw new Error('DUPLICATE_EMAIL');
		if (e.message.indexOf('users_id_number_clinic_id_unique') !== -1) throw new Error('DUPLICATE_ID_NUMBER');
	}
	throw new Error(e);
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
				.catch(checkForNonUniqueField)
		},
		editAdministrator(_, user, context) {
			return checkAccess(context, ROLES.SYSTEM_ADMIN)
				.then(() => context.Users.editUser(user))
				.then(res => ({ status: res }))
				.catch(checkForNonUniqueField)
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
				.catch(checkForNonUniqueField)
		},
		editTherapist(_, user, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.editUser(user))
				.then(res => ({ status: res }))
				.catch(checkForNonUniqueField)
		},
		deleteTherapist(_, { id }, context) {
			return checkAccess(context, ROLES.CLINIC_ADMIN)
				.then(() => context.Users.deleteUser({ id }))
				.then(res => ({ status: res }))
		},

		addPatient(_, { clinic_id, patient }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Users.createUser({
					clinic_id,
					...patient,
					role: ROLES.PATIENT
				}))
				.then(async ([id]) => {
					console.log(id);
					const patient = await context.Users.findOne(id);
					pubsub.publish('patientCreated', patient);
					return { status: true };
				})
				.catch(checkForNonUniqueField)
		},
		editPatient(_, { id, patient }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Users.editUser({
					id,
					...patient
				}))
				.then(() => context.Users.findOne(id))
				.then(patient => {
					pubsub.publish('patientUpdated', patient);
					return { status: true };
				})
				.catch(checkForNonUniqueField)
		},
		deletePatient(_, { id }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Users.findOne(id))
				.then(async patient => {
					const res = await context.Users.deleteUser({ id });
					if (res) {
						pubsub.publish('patientDeleted', patient);
						return { status: true };
					}
				})
				.then(res => ({ status: res }))
		},

		addTreatmentSeries(_, series, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.addSeries(series))
				.then(async ([id]) => {
					const series = await context.Treatments.findOne(id);
					pubsub.publish('treatmentSeriesCreated', series);
					return { status: true };
				})
		},
		editTreatmentSeries(_, series, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.editSeries(series))
				.then(() => context.Treatments.findOne(series.id))
				.then(series => {
					console.log(series);
					pubsub.publish('treatmentSeriesUpdated', series);
					return { status: true };
				})
		},
		deleteTreatmentSeries(_, { id }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.findOne(id))
				.then(async series => {
					const res = await context.Treatments.deleteSeries({ id });
					if (res) {
						pubsub.publish('treatmentSeriesDeleted', series);
						return { status: true };
					}
				})
		},

		addTreatment(_, { series_id, treatment }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.addTreatment({ series_id, ...treatment }))
				.then(async () => {
					const series = await context.Treatments.findOne(series_id);
					pubsub.publish('treatmentSeriesUpdated', series);
					return series;
				})
				.then(res => ({ status: true }))
		},
		editTreatment(_, { id, treatment }, context) {
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.editTreatment({
					id,
					...treatment
				}))
				.then(async () => {
					treatment = await context.Treatments.findOneTreatment(id);
					const series = await context.Treatments.findOne(treatment.series_id);
					pubsub.publish('treatmentSeriesUpdated', series);
					return series;
				})
				.then(res => ({ status: true }))
		},
		deleteTreatment(_, { id }, context) {
			let series_id;
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.findOneTreatment(id))
				.then(treatment => {
					series_id = treatment.series_id;
				})
				.then(() => context.Treatments.deleteTreatment({ id }))
				.then(() => context.Treatments.findOne(series_id))
				.then((series) => {
					pubsub.publish('treatmentSeriesUpdated', series);
				})
				.then(res => ({ status: true }))
		},
	},
	Subscription: {
		patientCreated(patient) {
			return patient;
		},
		patientUpdated(patient) {
			return patient;
		},
		patientDeleted(patient) {
			return patient;
		},
		treatmentSeriesCreated(series) {
			return series;
		},
		treatmentSeriesUpdated(series) {
			return series;
		},
		treatmentSeriesDeleted(series) {
			return series;
		},
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
			return series.treatments || context.Treatments.getTreatments(series.id);
		}
	},
	Treatment: {
		therapists(treatment, _, context) {
			return treatment.therapists || context.Users.getUsers(safeParse(treatment.therapist_ids));
		},
		patients(treatment, _, context) {
			return treatment.patients || context.Users.getUsers(safeParse(treatment.patient_ids));
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
