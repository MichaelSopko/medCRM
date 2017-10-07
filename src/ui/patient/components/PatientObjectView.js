import React, { PropTypes } from 'react';
import moment from 'moment';
import { Page, Text, View, StyleSheet } from '@react-pdf/core';

const PatientObjectView = (props) => {
	const { object, patient, renderFields, showHearingTest, formatMessage } = props;
	const ageDiff = object && moment.duration(parseInt(object.patient_age));

	const { __typename, ...fields } = object.fields || {};

	return (
		<Page size='A4'>
			<View>
				<View>
					<View>
						<Text>{formatMessage({ id: 'Patients.diagnose_date' })}:</Text>
						<Text>{moment(object.date).format('L')}</Text>
					</View>
					<View>
						<Text>{formatMessage({ id: 'common.field_birth_date' })}:</Text>
						<Text>{moment(patient.birth_date).format('L')}</Text>
					</View>
					<View>
						<Text>{formatMessage({ id: 'Patients.age_in_diagnose' })}:</Text>
						<Text>
							{formatMessage({ id: 'Patients.age', values: {
								years: ageDiff.years() || '0',
								months: ageDiff.months() || '0',
								days: ageDiff.days() || '0',
							}})}
						</Text>
					</View>
					{showHearingTest && !!object.hearing_test_date && <View>
						<Text>{formatMessage({ id: 'Patients.hearing_test' })}:</Text>
						<View>
							<Text>{object.hearing_test_remark}</Text>
							<Text>{moment(object.hearing_test_date).format('L')}</Text>
						</View>
					</View>}
					<View>
						<Text>{formatMessage({ id: 'Patients.print_date' })}:</Text>
						<Text>{moment().format('L')}</Text>
					</View>
				</View>
			</View>
			<View>
				<View>
					<View>
						<Text>{formatMessage({ id: 'Patients.patient_name' })}:</Text>
						<Text>{patient.first_name} {patient.last_name}</Text>
					</View>
					<View>
						<Text>{formatMessage({ id: 'Patients.field_health_maintenance' })}:</Text>
						<Text>{formatMessage({ id: `health_maintenance.${patient.health_maintenance}` })}</Text>
					</View>
					<View>
						<Text>ID#:</Text>
						<Text>{patient.id_number}</Text>
					</View>
					<View>
						<Text>{formatMessage({ id: 'common.gender.field_name' })}:</Text>
						<Text>{formatMessage({ id: `common.gender.${patient.gender}` })}</Text>
					</View>
					<View>
						<Text>Relatives</Text>
						<View>
							{patient.related_persons.map(prsn => (
								<Text>{formatMessage({ id: `related_persons.${prsn.type}` })}, {prsn.description}</Text>
							))}
						</View>
					</View>
					<View>
						<Text>{formatMessage({ id: 'Patients.diagnose_fillers' })}:</Text>
						<View>
							{object.fillers.map(flr => (
								<View>
									<Text>{flr.first_name} {flr.last_name}</Text>
									{!!flr.role &&
									<Text>, {formatMessage({ id: 'common.field_licence' })} {flr.license_number}</Text>}
								</View>
							))}
						</View>
					</View>
				</View>
			</View>
		</Page>
	);
};

export default PatientObjectView;
