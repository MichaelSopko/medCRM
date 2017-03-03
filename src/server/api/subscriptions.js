import { SubscriptionManager } from 'graphql-subscriptions'
import schema, { pubsub } from './schema'

const compareIds = args => entity => +entity.clinic_id === +args.clinic_id;

const subscriptionManager = new SubscriptionManager({
	schema,
	pubsub,
	setupFunctions: {
		patientCreated: (options, args) => ({
			patientCreated: {
				filter: compareIds(args)
			}
		}),
		patientUpdated: (options, args) => ({
			patientUpdated: {
				filter: compareIds(args)
			}
		}),
		patientDeleted: (options, args) => ({
			patientDeleted: {
				filter: compareIds(args)
			}
		}),
		treatmentSeriesCreated: (options, args) => ({
			treatmentSeriesCreated: {
				filter: compareIds(args)
			}
		}),
		treatmentSeriesUpdated: (options, args) => ({
				treatmentSeriesUpdated: {
					filter: compareIds(args)
				}
		}),
		treatmentSeriesDeleted: (options, args) => ({
			treatmentSeriesDeleted: {
				filter: compareIds(args)
			}
		}),
	},
});

export { subscriptionManager, pubsub };