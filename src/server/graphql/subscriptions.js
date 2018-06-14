import { SubscriptionManager } from 'graphql-subscriptions'
// import schema, { pubsub } from './schema'
import schema, { pubsub } from '../api/schema'

const compareID = args => entity =>  +entity.id === +args.id;
const comparePatient = args => entity => +entity.patient_id === +args.patient_id;
const compareClinic = args => entity => +entity.clinic_id === +args.clinic_id;

const subscriptionManager = new SubscriptionManager({
	schema,
	pubsub,
	setupFunctions: {
		patientCreated: (options, args) => ({
			patientCreated: {
				filter: compareClinic(args)
			}
		}),
		patientUpdated: (options, args) => ({
			patientUpdated: {
				filter: compareID(args)
			}
		}),
		patientDeleted: (options, args) => ({
			patientDeleted: {
				filter: compareClinic(args)
			}
		}),
        clinicUpdated: (options, args) => ({
            clinicUpdated: {
                filter: compareID(args)
            }
        }),
        therapistUpdated: (options, args) => ({
            therapistUpdated: {
                filter: compareID(args)
            }
        }),
		treatmentSeriesCreated: (options, args) => ({
			treatmentSeriesCreated: {
				filter: comparePatient(args)
			}
		}),
		treatmentSeriesUpdated: (options, args) => ({
				treatmentSeriesUpdated: {
					filter: comparePatient(args)
				}
		}),
		treatmentSeriesDeleted: (options, args) => ({
			treatmentSeriesDeleted: {
				filter: comparePatient(args)
			}
		}),
	},
});

export { subscriptionManager, pubsub };