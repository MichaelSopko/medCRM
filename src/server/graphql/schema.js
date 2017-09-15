import { makeExecutableSchema, addErrorLoggingToSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';

import log from '../../log';
import makeExecutableSchemaWithModules from './utils/makeExecutableSchemaWithModules';

import * as rootModule from './modules/root';
import * as clinicModule from './modules/clinic';
import * as patientModule from './modules/patient';
import * as patientObjectsModule from './modules/patient_objects';
import * as treatmentSeriesModule from './modules/treatment_series';

export const pubsub = new PubSub();

const executableSchema = makeExecutableSchemaWithModules([
	rootModule,
	clinicModule,
	patientModule,
	patientObjectsModule,
	treatmentSeriesModule,
]);

addErrorLoggingToSchema(executableSchema, { log: (e) => log.error(e) });

export default executableSchema;
