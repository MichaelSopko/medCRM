import { SubscriptionManager } from 'graphql-subscriptions'
import schema, { pubsub } from './schema'

const subscriptionManager = new SubscriptionManager({
	schema,
	pubsub,
	setupFunctions: {
		patientCreated: (options, args) => ({
			patientCreated: patient => patient.clinic_id === args.clinic_id
		}),
		patientUpdated: (options, args) => ({
			patientUpdated: patient => patient.clinic_id === args.clinic_id,
		}),
		patientDeleted: (options, args) => ({
			patientDeleted: patient => patient.clinic_id === args.clinic_id,
		}),
		treatmentSeriesCreated: (options, args) => ({
			treatmentSeriesCreated: treatmentSeries => treatmentSeries.clinic_id === args.clinic_id,
		}),
		treatmentSeriesUpdated: (options, args) => ({
			treatmentSeriesUpdated: treatmentSeries => treatmentSeries.clinic_id === args.clinic_id,
		}),
		treatmentSeriesDeleted: (options, args) => ({
			treatmentSeriesDeleted: treatmentSeries => treatmentSeries.clinic_id === args.clinic_id,
		}),
	},
});

export { subscriptionManager, pubsub };