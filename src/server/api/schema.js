/* eslint-disable max-len,no-param-reassign */
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
import { clinic as defaultClinic } from '../../helpers/constants/general';
import heMessages from '../../l10n/he.json';
import enMessages from '../../l10n/en.json';

const { template: emailTemplate, registerUserTemplate, ...mailerConfig } = emailConfig;
const messages = __DEV__ ? enMessages : heMessages;
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
    treatmentsList(ignored1, { patient_id, clinic_id, therapist_id }, context) {
        return context.Treatments.getTreatmentsList({
            patient_id,
            clinic_id,
			therapist_id,
        });
    },
	treatmentObjects(ignored1, { patient_id, clinic_id, therapist_id }, context) {
		return context.Treatments.getTreatmentObjects({
			patient_id,
			clinic_id,
			therapist_id,
		}).then((objects) => {
			return objects.map(({ fields, ...obj }) => ({ ...obj, ...(JSON.parse(fields)) }));
		});
	},
    treatmentSeries(ignored1, { patient_id, clinic_id, therapist_id }, context) {
      return context.Treatments.getSeries({
        patient_id,
        clinic_id,
        therapist_id,
      });
    },
	  past_treatments(ignored1, { patient_id }, context) {
		  return context.Treatments.getPastTreatmentsCount(patient_id);
	  },
	  future_treatments(ignored1, { patient_id }, context) {
		  return context.Treatments.getFeatureTreatmentsCount(patient_id);
	  },
	  total_treatments(ignored1, { patient_id }, context) {
		  return context.Treatments.getPatientTreatmentsCount(patient_id);
	  },
	  school_observations(ignored1, { patient_id }, context) {
		  return context.Treatments.getPatientTreatmentObjects(patient_id)
			  .then((objects) => {
				  return objects.map(({fields, ...obj}) => ({...obj, ...(JSON.parse(fields))}))
					  .filter((obj) => (obj.therapist_ids !== undefined || obj.therapists !== undefined) && !obj.start_date);
			  }).then((objects) => {
				  return objects.length;
			  });
	  },
	  staff_meetings(ignored1, { patient_id }, context) {
		  return context.Treatments.getPatientTreatmentObjects(patient_id)
			  .then((objects) => {
				  return objects.map(({fields, ...obj}) => ({...obj, ...(JSON.parse(fields))}))
					  .filter((obj) => obj.participant_ids !== undefined || obj.participants !== undefined)
			  })
			  .then((objects) => {
				  return objects.length;
			  });
	  },
	  outside_source_consults(ignored1, { patient_id }, context) {
		  return context.Treatments.getPatientTreatmentObjects(patient_id)
			  .then((objects) => {
				  return objects.map(({fields, ...obj}) => ({...obj, ...(JSON.parse(fields))}))
					  .filter((obj) => obj.consultantRole !== undefined || obj.meetingSummary !== undefined)
			  })
			  .then((objects) => {
				  return objects.length;
			  });
	  },
    currentUser(ignored1, ignored2, context) {
      return context.Users.findOne(context.currentUser.id);
    },
  },
  Mutation: {
    async signUp(_, user, context) {
      const clinic = { ...defaultClinic };

      clinic.name = `${user.first_name} ${user.last_name}`;

      let clinicResult = null;

      try {
        clinicResult = await context.Clinics.addClinic(clinic);
      } catch (exc) {
        return Promise.reject(exc);
      }

      if (clinicResult) {
        const [clinicId] = clinicResult;
        user.clinic_id = clinicId;
      }

      return context.Users.createUser({
        ...user,
        login: user.email,
        role: ROLES.THERAPIST,
      })
        .then((res) => {
          const mailOptions = {
            from: `"Clinic" <${mailerConfig.auth.user}>`,
            to: user.email,
            subject: messages.Therapists.registration_email.subject,
            html: registerUserTemplate(user),
          };

          transporter.sendMail(mailOptions).then((info) => {
            console.log('Message %s sent: %s', info.messageId, info.response);
          }).catch((exc) => {
            console.error(exc);
          });

          return { status: res };
        })
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
        .then(res => {
            return context.Clinics.findOne(id);
        })
          .then((clinic) => {
              pubsub.publish('clinicUpdated', clinic);
              return clinic;
          });
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

    createTherapist(_, { clinic_id, therapist }, context) {
      return checkAccess(context, ROLES.SYSTEM_ADMIN)
          .then(() => context.Users.createUser({ clinic_id, ...therapist, role: ROLES.THERAPIST }))
          .then(id => context.Users.findOne(id))
          .catch(checkForNonUniqueField);
    },
	updateTherapist(_, { id, therapist }, context) {
      return checkAccess(context, ROLES.CLINIC_ADMIN)
        .then(() => context.Users.editUser({ id, ...therapist }))
        .then(res => context.Users.findOne(id))
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
          .then((id) => context.Treatments.findOne(id))
        .then((series) => {
			console.log(series);
			pubsub.publish('treatmentSeriesCreated', series);
			return {status: true};
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

    async addTreatment(_, {
		series_id, patient_id, clinic_id, object: {
			TreatmentInput, ...restObject,
		},
	}, ctx) {
      await checkAccess(ctx, ROLES.THERAPIST);
      const { Treatments, Treatment, TreatmentSeries, TreatmentObject } = ctx;
      let newObject;
	
		if (TreatmentInput) {
			let { repeat_weeks, ...treatment } = TreatmentInput;
			const isExists = await ctx.Treatments.isTreatmentExistsByTime(treatment.start_date, treatment.end_date);
			if (isExists) {
				throw new Error('Treatments.treatment_collided_error');
			}
			if (repeat_weeks) {
				while (repeat_weeks--) {
					let { start_date, end_date, ...fields } = treatment;
					start_date = moment(start_date).add(repeat_weeks, 'weeks').format('YYYY-MM-DD HH:mm:ss');
					end_date = moment(end_date).add(repeat_weeks, 'weeks').format('YYYY-MM-DD HH:mm:ss');
					await Treatments.addTreatment({
						series_id,
						patient_id,
						clinic_id,
						start_date,
						end_date,
						...fields,
					});
				}
			} else {
				await Treatments.addTreatment({ series_id, patient_id, clinic_id, ...treatment });
			}
			newObject = {
				id: -1,
				...TreatmentInput,
			};
		} else if (Object.keys(restObject).length) {
			const { SchoolObservationInput, StaffMeetingInput, OutsideSourceConsultInput } = restObject;
			const { date, ...fields } = SchoolObservationInput || StaffMeetingInput || OutsideSourceConsultInput;
			const inserted = await TreatmentObject.query().insertAndFetch({
				series_id,
				patient_id,
				clinic_id,
				date,
				fields,
			});
			newObject = { ...inserted, ...inserted.fields };
		}
		
      pubsub.publish('treatmentSeriesUpdated', {});
      return { status: true };
    },
    async editTreatment(_,  {
		id, object: {
			TreatmentInput, ...restObject,
		},
	}, context) {
		if (TreatmentInput) {
			let treatment = TreatmentInput;
			const isExists = await context.Treatments.isTreatmentExistsByTime(treatment.start_date, treatment.end_date, id);
			if (isExists) {
				throw new Error('Treatments.treatment_collided_error');
			}
			const oldTreatment = await context.Treatments.findOneTreatment(id);
			const currentUser = context.currentUser;
			
			return checkAccess(context, ROLES.THERAPIST)
				.then(() => context.Treatments.editTreatment({
					id,
					...treatment,
				}))
                .then(async () => {
					treatment = await context.Treatments.findOneTreatment(id);
					pubsub.publish('treatmentSeriesUpdated', {});
	
					let { related_persons, first_name, last_name } = await context.Users.findOne(treatment.patient_id);
					related_persons = safeParse(related_persons, []);
	
					related_persons.filter(person => person.receive_updates).forEach(person => {
		
						const templateConfig = {
							old_date: moment(oldTreatment.start_date).format('DD.MM.YYYY'),
							old_time: moment(oldTreatment.start_date).format('HH:mm'),
							new_time: moment(treatment.start_date).format('HH:mm'),
							new_date: moment(treatment.start_date).format('DD.MM.YYYY'),
							therapist_name: `${currentUser.first_name} ${currentUser.last_name}`,
							relative_name: person.name,
							patient_name: `${first_name} ${last_name}`,
						};
		
						let mailOptions = {
							from: `"Clinic" <${mailerConfig.auth.user}>`,
							to: person.email,
							subject: heMessages.Treatments.update_email.subject,
							html: emailTemplate(templateConfig),
						};
		
						transporter.sendMail(mailOptions).then(info => {
							console.log('Message %s sent: %s', info.messageId, info.response);
						});
					});
	
					return treatment;
                });
        } else if (Object.keys(restObject).length) {
			const { SchoolObservationInput, StaffMeetingInput, OutsideSourceConsultInput } = restObject;
			const { date, ...fields } = SchoolObservationInput || StaffMeetingInput || OutsideSourceConsultInput;
			const updatedTreatment = await context.TreatmentObject.query().updateAndFetchById(id, { date, fields });
			pubsub.publish('treatmentSeriesUpdated', {});
			return {
				...updatedTreatment,
				...updatedTreatment.fields,
			};
		}
	
		return { status: true };
	},
    deleteTreatment(_, { id }, context) {
      return checkAccess(context, ROLES.THERAPIST)
        .then(() => context.Treatments.deleteTreatment({ id }))
        .then(() => {
          pubsub.publish('treatmentSeriesUpdated', {});
        })
        .then(res => ({ status: true }));
    },
	  deleteTreatmentSeriesObject(_, { id }, context) {
		  return checkAccess(context, ROLES.THERAPIST)
			  .then(() => context.Treatments.deleteTreatmentObject({ id }))
			  .then(() => {
				  pubsub.publish('treatmentSeriesUpdated', {});
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
    clinicUpdated(clinic) {
        console.log('Upp', clinic.id)
      return clinic;
    },
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
	TreatmentSeriesObject: {
		__resolveType(obj, context, info){
			if((obj.therapist_ids !== undefined || obj.therapists !== undefined) && !obj.start_date){
				return 'SchoolObservation';
			}
			if(obj.participant_ids !== undefined || obj.participants !== undefined){
				return 'StaffMeeting';
			}
			if(obj.consultantRole !== undefined || obj.meetingSummary !== undefined){
				return 'OutsideSourceConsult';
			}
			if(obj.start_date !== undefined){
				return 'Treatment';
			}
			console.log(obj);
			throw Error('cant resolve object type');
		},
	},
	SchoolObservation: {
		async therapists(obj, args, { TreatmentObject, Users }) {
			if (obj.therapist_ids) {
				return Users.getUsers(obj.therapist_ids);
			} else {
				return [];
			}
		},
		patient(obj, _, ctx) {
			if (obj.patient_id) {
				return ctx.Users.findOne(obj.patient_id);
			} else {
				return [];
			}
		},
	},
	StaffMeeting: {
		async participants(obj, args, { TreatmentObject, Users }) {
			if (obj.participant_ids) {
				const realIds = obj.participant_ids.filter(Number);
				const fakeIds = obj.participant_ids.filter(id => !realIds.some(realId => realId === id));
				const realParticipants = await Users.getUsers(realIds);
				const fakeParticipants = fakeIds.map(id => ({
					id,
					first_name: id,
					last_name: '',
				}));
				return [...realParticipants, ...fakeParticipants];
			}
			
			return [];
		},
		meetingPurpose(obj) {
			return obj.meetingPurpose || null;
		},
		patient(obj, _, ctx) {
			if (obj.patient_id) {
				return ctx.Users.findOne(obj.patient_id);
			}
			
			return [];
		},
	},
	OutsideSourceConsult: {
		patient(obj, _, ctx) {
			if (obj.patient_id) {
				return ctx.Users.findOne(obj.patient_id);
			}
			
			return [];
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
	  patient(treatment, _, ctx) {
		  return ctx.Users.findOne(treatment.patient_id);
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
