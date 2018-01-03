/* eslint-disable max-len */
import { makeExecutableSchema, addErrorLoggingToSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';
import nodemailer from 'nodemailer';
import moment from 'moment';
import ROLES from '../../helpers/constants/roles';
import checkAccessLogic from '../../helpers/checkAccessLogic';
// import { GraphQLScalarType } from 'graphql';
// import { Kind } from 'graphql/language';
// import GraphQLJSON from 'graphql-type-json';
// import CustomGraphQLDateType from 'graphql-custom-datetype';
import GraphQLMomentMySQL from './GraphQLMomentMySQL';

import log from '../../log';
import schema from './schema_def.graphqls';
import emailConfig from '../../../config/email.config';
import heMessages from '../../l10n/he.json';

const { template: emailTemplate, ...mailerConfig } = emailConfig;

const transporter = nodemailer.createTransport(mailerConfig);

export const pubsub = new PubSub();

const safeParse = (json, deflt = []) => {
  try {
    return JSON.parse(json || `${deflt}`);
  } catch (e) {
    log('JSON parse error');
    return deflt;
  }
};

async function checkAccess(ctx, role) {
  const user = await ctx.Users.findOne(ctx.currentUser.id);
  const isOk = checkAccessLogic(user.role, role);
  if (isOk) {
    return user;
  }
  throw new Error('Access denied');
}

function checkForNonUniqueField(e) {
  if (e.code === 'ER_DUP_ENTRY') {
    if (e.message.indexOf('users_email_unique') !== -1) {
      throw new Error('DUPLICATE_EMAIL');
    }
    if (e.message.indexOf('users_id_number_clinic_id_unique') !== -1) {
      throw new Error('DUPLICATE_ID_NUMBER');
    }
  }
  throw new Error(e);
}

const resolvers = {
  Query: {
    clinics(ignored1, ignored2, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Clinics.getClinics());
    },
    administrators(ignored1, ignored2, context) {
      return context.Users.findByRole(ROLES.CLINIC_ADMIN);
    },
    therapists(ignored1, { clinic_id }, context) {
      return context.Users.findByRole(ROLES.THERAPIST, clinic_id);
    },
    patients(ignored1, { clinic_id, archived }, context) {
      return context.Users.findByRole(ROLES.PATIENT, clinic_id, archived);
    },
    patient(_, { id }, context) {
      return context.Users.findOne(id);
    },
    treatmentSeries(ignored1, { patient_id, clinic_id, therapist_id }, context) {
      return context.Treatments.getSeries({
        patient_id,
        clinic_id,
        therapist_id,
      });
    },
    currentUser(ignored1, ignored2, context) {
      return context.Users.findOne(context.currentUser.id);
    },
  },
  Mutation: {
    signUp(_, user, context) {
      return context.Users.createUser({
        ...user,
        login: user.email,
        role: ROLES.THERAPIST,
      })
        .then(res => ({ status: res }))
        .catch(checkForNonUniqueField);
    },
    addClinic(_, { clinic }, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Clinics.addClinic(clinic))
        .then(([id]) => context.Clinics.findOne(id));
    },
    editClinic(_, { id, clinic }, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Clinics.editClinic(id, clinic))
        .then(res => context.Clinics.findOne(id));
    },
    deleteClinic(_, { id }, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Clinics.deleteClinic({ id }))
        .then(res => ({ id }));
    },

    addAdministrator(_, user, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Users.createUser({
          ...user,
          role: ROLES.CLINIC_ADMIN,
        }))
        .then(res => ({ status: res }))
        .catch(checkForNonUniqueField);
    },
    editAdministrator(_, user, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Users.editUser(user))
        .then(res => ({ status: res }))
        .catch(checkForNonUniqueField);
    },
    deleteAdministrator(_, { id }, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
        .then(() => context.Users.deleteUser({ id }))
        .then(res => ({ status: res }));
    },

    addTherapist(_, user, context) {
      return checkAccess(context, ROLES.CLINIC_ADMIN)
        .then(() => context.Users.createUser({
          ...user,
          role: ROLES.THERAPIST,
        }))
        .then(res => ({ status: res }))
        .catch(checkForNonUniqueField);
    },
    editTherapist(_, user, context) {
      return checkAccess(context, ROLES.CLINIC_ADMIN)
        .then(() => context.Users.editUser(user))
        .then(res => ({ status: res }))
        .catch(checkForNonUniqueField);
    },
    deleteTherapist(_, { id }, context) {
      return checkAccess(context, ROLES.CLINIC_ADMIN)
        .then(() => context.Users.deleteUser({ id }))
        .then(res => ({ status: res }));
    },

    async addPatient(_, { clinic_id, patient }, context) {
      await checkAccess(context, ROLES.THERAPIST);
      const { Users, Clinics } = context;
      const { patients_limit } = await Clinics.findOne(clinic_id);
      const patients = await Users.findByRole(ROLES.PATIENT, clinic_id);
      if (patients.length >= +patients_limit) {
        throw new Error(JSON.stringify({
          code: 'PATIENTS_LIMIT',
          payload: patients_limit,
        }));
      }

      try {
        const [id] = await Users.createUser({
          clinic_id,
          ...patient,
          role: ROLES.PATIENT,
        });
        patient = await Users.findOne(id);
        pubsub.publish('patientCreated', patient);
        return patient;
      } catch (e) {
        checkForNonUniqueField(e);
      }
    },
    editPatient(_, { id, patient }, context) {
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Users.editUser({
          id,
          ...patient,
        }))
        .then(() => context.Users.findOne(id))
        .then((patient) => {
          pubsub.publish('patientUpdated', patient);
          return patient;
        })
        .catch(checkForNonUniqueField);
    },
    deletePatient(_, { id }, context) {
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Users.findOne(id))
        .then(async (patient) => {
          const res = await context.Users.deleteUser({ id });
          if (res) {
            pubsub.publish('patientDeleted', patient);
            return patient;
          }
        })
        .then(res => ({ status: res }));
    },
    async unarchivePatient(_, { id }, context) {
      const currentUser = await checkAccess(context, ROLES.THERAPIST);
      const isAdmin = currentUser.role === ROLES.SYSTEM_ADMIN;
      const { Users, Clinics } = context;
      const { clinic_id, archived_date } = await Users.findOne(id);
      const { patients_limit, archive_time } = await Clinics.findOne(clinic_id);
      const patients = await Users.findByRole(ROLES.PATIENT, clinic_id);
      if (!isAdmin && patients.length >= +patients_limit) {
        throw new Error(JSON.stringify({
          code: 'PATIENTS_LIMIT',
          payload: patients_limit,
        }));
      }
      if (!isAdmin && archive_time && moment(archived_date).diff(moment(), 'minutes') < archive_time) {
        throw new Error(JSON.stringify({
          code: 'TIME_LIMIT',
          payload: archive_time,
        }));
      }
      await Users.editUser({
        id,
        archived: false,
      });
      return Users.findOne(id);
    },
    async archivePatient(_, { id }, context) {
      await checkAccess(context, ROLES.THERAPIST);
      const { Users, Clinics } = context;

      await Users.editUser({
        id,
        archived: true,
        archived_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      });
      return Users.findOne(id);
    },

    addTreatmentSeries(_, series, context) {
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Treatments.addSeries(series))
        .then(async ([id]) => {
          const series = await context.Treatments.findOne(id);
          pubsub.publish('treatmentSeriesCreated', series);
          return { status: true };
        });
    },
    editTreatmentSeries(_, series, context) {
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Treatments.editSeries(series))
        .then(() => context.Treatments.findOne(series.id))
        .then((series) => {
          console.log(series);
          pubsub.publish('treatmentSeriesUpdated', series);
          return { status: true };
        });
    },
    deleteTreatmentSeries(_, { id }, context) {
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Treatments.findOne(id))
        .then(async (series) => {
          const res = await context.Treatments.deleteSeries({ id });
          if (res) {
            pubsub.publish('treatmentSeriesDeleted', series);
            return { status: true };
          }
        });
    },

    async addTreatment(_, { series_id, treatment: { repeat_weeks, ...treatment } }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const isExists = await ctx.Treatments.isTreatmentExistsByTime(treatment.start_date, treatment.end_date);
      if (isExists) {
        throw new Error('Treatments.treatment_collided_error');
      }
      const { Treatments } = ctx;
      if (repeat_weeks) {
        while (repeat_weeks--) {
          let { start_date, end_date, ...fields } = treatment;
          start_date = moment(start_date).add(repeat_weeks, 'weeks').format('YYYY-MM-DD HH:mm:ss');
          end_date = moment(end_date).add(repeat_weeks, 'weeks').format('YYYY-MM-DD HH:mm:ss');
          await Treatments.addTreatment({
            series_id,
            start_date,
            end_date,
            ...fields,
          });
        }
      } else {
        await Treatments.addTreatment({ series_id, ...treatment });
      }
      const series = await Treatments.findOne(series_id);
      pubsub.publish('treatmentSeriesUpdated', series);
      return { status: true };
    },
    async editTreatment(_, { id, treatment }, context) {
      const isExists = await context.Treatments.isTreatmentExistsByTime(treatment.start_date, treatment.end_date, id);
      if (isExists) {
        throw new Error('Treatments.treatment_collided_error');
      }
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Treatments.editTreatment({
          id,
          ...treatment,
        }))
        .then(async () => {
          treatment = await context.Treatments.findOneTreatment(id);
          const series = await context.Treatments.findOne(treatment.series_id);
          pubsub.publish('treatmentSeriesUpdated', series);

          let { related_persons } = await context.Users.findOne(series.patient_id);
          related_persons = safeParse(related_persons, []);

          const mailOptions = {
            from: `"Clinic" <${mailerConfig.auth.user}>`,
            to: related_persons.filter(p => !!p.receive_updates).map(p => p.email),
            subject: heMessages.Treatments.update_email.subject,
            html: emailTemplate(treatment),
          };

          transporter.sendMail(mailOptions).then((info) => {
            console.log('Message %s sent: %s', info.messageId, info.response);
          });

          return treatment;
        });
    },
    deleteTreatment(_, { id }, context) {
      let series_id;
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Treatments.findOneTreatment(id))
        .then((treatment) => {
          series_id = treatment.series_id;
        })
        .then(() => context.Treatments.deleteTreatment({ id }))
        .then(() => context.Treatments.findOne(series_id))
        .then((series) => {
          pubsub.publish('treatmentSeriesUpdated', series);
        })
        .then(res => ({ status: true }));
    },
    async addPatientFile(_, { file }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Users } = ctx;
      await Users.addPatientFile(file);
      const patient = await Users.findOne(file.patient_id);
      pubsub.publish('patientUpdated', patient);
      return patient;
    },
    async deletePatientFile(_, { id }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Users } = ctx;
      const file = await Users.getPatientFile(id);
      await Users.deletePatientFile(file.id);
      const patient = await Users.findOne(file.patient_id);
      pubsub.publish('patientUpdated', patient);
      return patient;
    },
    async addDiagnose(_, { input }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Users } = ctx;
      await Users.addDiagnose(input);
      const patient = await Users.findOne(input.patient_id);
      pubsub.publish('patientUpdated', patient);
      return patient;
    },
    async addTreatmentSummary(_, { input }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Users } = ctx;
      await Users.addTreatmentSummary(input);
      const patient = await Users.findOne(input.patient_id);
      pubsub.publish('patientUpdated', patient);
      return patient;
    },
    async editDiagnose(_, { id, input }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Users } = ctx;
      await Users.editDiagnose(id, input);
      const patient = await Users.findOne(input.patient_id);
      pubsub.publish('patientUpdated', patient);
      return patient;
    },
    async editTreatmentSummary(_, { id, input }, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Users } = ctx;
      await Users.editTreatmentSummary(id, input);
      const patient = await Users.findOne(input.patient_id);
      pubsub.publish('patientUpdated', patient);
      return patient;
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
    },
  },
  Therapist: {
    clinic(user, _, context) {
      return context.Clinics.findOne(user.clinic_id);
    },
  },
  Patient: {
    related_persons(user, _, ctx) {
      return safeParse(user.related_persons);
    },
    files(user, _, ctx) {
      return ctx.Users.getPatientFiles(user.id);
    },
    diagnoses(user, _, ctx) {
      return ctx.Users.getDiagnoses(user.id);
    },
    treatment_summary(user, _, ctx) {
      return ctx.Users.getTreatmentSummary(user.id);
    },
  },
  Diagnose: {
    async fillers(diagnose, _, context) {
      if (!diagnose || !diagnose.fillers_ids) {
        return [];
      }
      const fillers = safeParse(diagnose.fillers_ids, '[]') || [];
      const customFillers = fillers.filter(flr => isNaN(parseInt(flr))).map(flr => ({
        id: -1,
        first_name: flr,
      }));
      const realFillers = await context.Users.getUsers(fillers);
      console.log([...realFillers, ...customFillers]);
      return [...realFillers, ...customFillers];
    },
    fields(diagnose, _, ctx) {
      return safeParse(diagnose.fields, '{}');
    },
  },
  // TODO: union type
  TreatmentSummary: {
    async fillers(diagnose, _, context) {
      if (!diagnose || !diagnose.fillers_ids) {
        return [];
      }
      const fillers = safeParse(diagnose.fillers_ids, '[]') || [];
      const customFillers = fillers.filter(flr => isNaN(parseInt(flr, 10))).map(flr => ({
        id: -1,
        first_name: flr,
      }));
      const realFillers = await context.Users.getUsers(fillers);
      console.log([...realFillers, ...customFillers]);
      return [...realFillers, ...customFillers];
    },
    fields(diagnose, _, ctx) {
      return safeParse(diagnose.fields, '{}');
    },
  },
  CurrentUser: {
    clinic(user, _, context) {
      console.log(user);
      return context.Clinics.findOne(user.clinic_id);
    },
  },
  TreatmentSeries: {
    treatments(series, _, context) {
      return (series && series.treatments) || context.Treatments.getTreatments(series.id);
    },
    patient(series, _, ctx) {
      return ctx.Users.findOne(series.patient_id);
    },
  },
  Treatment: {
    therapists(treatment, _, context) {
      return (treatment && treatment.therapists) || context.Users.getUsers(safeParse(treatment.therapist_ids));
    },
  },
  Date: GraphQLMomentMySQL,
};

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

addErrorLoggingToSchema(executableSchema, { log: e => log.error(e) });

export default executableSchema;
