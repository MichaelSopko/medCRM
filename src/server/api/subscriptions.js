import { SubscriptionManager } from 'graphql-subscriptions'
import schema, { pubsub } from './schema'

const comparePatient = args => entity => +entity.id === +args.id;
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
				filter: comparePatient(args)
			}
		}),
		patientDeleted: (options, args) => ({
			patientDeleted: {
				filter: compareClinic(args)
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