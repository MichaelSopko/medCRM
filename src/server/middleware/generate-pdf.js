import ReactPDF from '@react-pdf/node';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import _ from 'lodash';
import { Document } from '@react-pdf/core';
import React from 'react';
import path from 'path';

import config from '../../../config';
import enMessages from '../../l10n/en.json';
import heMessages from '../../l10n/he.json';
import PatientObjectView from '../../ui/patient/components/PatientObjectView';
import GET_PATIENT_QUERY from '../../ui/patient/graphql/PatientGet.graphql';

const messages = config.locale === 'he' ? heMessages : enMessages;
const formatMessage = ({ id }) => _.get(messages, id);


export default async (req, res) => {
	// console.log(req);
	const networkInterface = createNetworkInterface({
		uri: `http${__SSL__ ? 's' : ''}://${req.headers.host}/graphql`,
		opts: {
			credentials: 'same-origin',
			headers: req.headers,
		},
	});
	const client = new ApolloClient({
		ssrMode: true,
		networkInterface,
	});

	const { data } = await client.query({
		query: GET_PATIENT_QUERY,
		variables: { id: req.params.patient_id },
	});
	const { patient } = data;
	const object = patient ? (patient.diagnoses.find(d => d.id == req.params.object_id) || patient.treatment_summary.find(d => d.id == req.params.object_id)) : {};

	console.log(object);

	const fileName = path.resolve(__dirname, `${patient.first_name}_${patient.last_name}_${object.id}.pdf`);

	ReactPDF.render((
		<Document>
			<PatientObjectView
				patient={patient}
				object={object}
				formatMessage={formatMessage}
			/>
		</Document>
	), fileName);


}

