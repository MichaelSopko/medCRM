import React from 'react';
import { Text, View } from '@react-pdf/core';

import { styles } from './PatientObjectView';

const renderTreatmentFields = (fields, formatMessage) => (
	Object.keys(fields).map((key, i) => fields[key] && (
		<View key={i}>
			<Text style={styles.heading1}>
				{formatMessage({ id: `TreatmentSummaryTab.${key}` })}
			</Text>
			<Text style={styles.text}>{fields[key]}</Text>
		</View>))
);

export default renderTreatmentFields;