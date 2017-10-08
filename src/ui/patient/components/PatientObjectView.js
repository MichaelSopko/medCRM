import React, { PropTypes } from 'react';
import moment from 'moment';
import { Page, Text, View, StyleSheet } from '@react-pdf/core';

import config from '../../../../config';
const isRtl = config.locale === 'he';

export const styles = StyleSheet.create({
	page: {
		padding: 24,
		display: 'flex',
		flexDirection: 'column',
	},
	tablesContainer: {
		display: 'flex',
		flexDirection: isRtl ? 'row-reverse' : 'row',
	},
	table: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		margin: 12,
	},
	row: {
		display: 'flex',
		flexDirection: isRtl ? 'row-reverse' : 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	rowName: {
		fontSize: 12,
		flex: 1,
	},
	rowValue: {
		fontSize: 12,
		flex: 1,
	},
	heading1: {
		fontWeight: 600,
		fontSize: 12,
		marginTop: 8,
		marginBottom: 4,
	},
	heading2: {
		fontWeight: 500,
		fontSize: 11,
		marginTop: 4,
		marginBottom: 2,
	},
	text: {
		fontSize: 11
	}
});

const PatientObjectView = (props) => {
	const { object, patient, renderFields, showHearingTest, formatMessage } = props;
	const ageDiff = object && moment.duration(parseInt(object.patient_age));

	const { __typename, ...fields } = object.fields || {};

	return (
		<Page size='A4' style={styles.page}>
			<View style={styles.tablesContainer}>
				<View style={styles.table}>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'Patients.diagnose_date' })}:</Text>
						<Text style={styles.rowValue}>{moment(object.date).format('L')}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'common.field_birth_date' })}:</Text>
						<Text style={styles.rowValue}>{moment(patient.birth_date).format('L')}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'Patients.age_in_diagnose' })}:</Text>
						<Text style={styles.rowValue}>
							{formatMessage({
								id: 'Patients.age', values: {
									years: ageDiff.years() || '0',
									months: ageDiff.months() || '0',
									days: ageDiff.days() || '0',
								},
							})}
						</Text>
					</View>
					{showHearingTest && !!object.hearing_test_date && (
						<View style={styles.row}>
							<Text style={styles.rowName}>{formatMessage({ id: 'Patients.hearing_test' })}:</Text>
							<View>
								<Text style={styles.rowValue}>{object.hearing_test_remark}</Text>
								<Text style={styles.rowValue}>{moment(object.hearing_test_date).format('L')}</Text>
							</View>
						</View> )}
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'Patients.print_date' })}:</Text>
						<Text style={styles.rowValue}>{moment().format('L')}</Text>
					</View>
				</View>

				<View style={styles.table}>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'Patients.patient_name' })}:</Text>
						<Text style={styles.rowValue}>{patient.first_name} {patient.last_name}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'Patients.field_health_maintenance' })}:</Text>
						<Text style={styles.rowValue}>{formatMessage({ id: `health_maintenance.${patient.health_maintenance}` })}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>ID#:</Text>
						<Text style={styles.rowValue}>{patient.id_number}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'common.gender.field_name' })}:</Text>
						<Text style={styles.rowValue}>{formatMessage({ id: `common.gender.${patient.gender}` })}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>Relatives</Text>
						<View>
							{patient.related_persons.map((prsn, i) => (
								<Text key={i} style={styles.rowValue}>{formatMessage({ id: `related_persons.${prsn.type}` })}, {prsn.description}</Text>
							))}
						</View>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowName}>{formatMessage({ id: 'Patients.diagnose_fillers' })}:</Text>
						<View>
							{object.fillers.map((flr, i) => (
								<View key={i}>
									<Text style={styles.rowValue}>{flr.first_name} {flr.last_name}</Text>
									{!!flr.role &&
									<Text
										style={styles.rowValue}>, {formatMessage({ id: 'common.field_licence' })} {flr.license_number}</Text>}
								</View>
							))}
						</View>
					</View>
				</View>
			</View>
			{renderFields(fields, formatMessage)}
		</Page>
	);
};

export default PatientObjectView;
