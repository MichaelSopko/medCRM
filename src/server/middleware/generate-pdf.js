import ReactPDF from '@react-pdf/node';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import _ from 'lodash';
import { Document } from '@react-pdf/core';
import React from 'react';
import path from 'path';
import fs from 'fs-extra';

import config from '../../../config';
import enMessages from '../../l10n/en.json';
import heMessages from '../../l10n/he.json';
import PatientObjectView from '../../ui/patient/components/PatientObjectView';
import GET_PATIENT_QUERY from '../../ui/patient/graphql/PatientGet.graphql';
import renderDiagnoseFields from '../../ui/patient/components/DiagnoseFieldsView';
import renderTreatmentFields from '../../ui/patient/components/TreatmentFieldsView';

const messages = config.locale === 'he' ? heMessages : enMessages;
const formatMessage = ({ id, values }) => {
	let str = _.get(messages, id) || id;
	if (!values) return str;
	Object.keys(values).forEach(key => {
		str = str.replace(`{${key}}`, values[key]);
	});
	return str;
};


export default async (req, res) => {
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


	const fileName = `${patient.first_name}_${patient.last_name}_${object.id}.pdf`;
	const dir = `documents/${patient.clinic_id}/`;
	await fs.ensureDir(dir);
	const filePath = path.resolve(dir, fileName);

	await ReactPDF.render((
		<Document>
			<PatientObjectView
				patient={patient}
				object={object}
				formatMessage={formatMessage}
				renderFields={object.__typename === 'Diagnose' ? renderDiagnoseFields : renderTreatmentFields}
				showHearingTest={object.__typename === 'Diagnose'}
			/>
		</Document>
	), filePath);

	return res.sendFile(filePath);

	return res.redirect('/' + dir + fileName);

}

