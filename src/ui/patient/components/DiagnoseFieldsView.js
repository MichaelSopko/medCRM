import React from 'react';
import { Text, View } from '@react-pdf/core';

import { styles } from './PatientObjectView';

const renderDiagnoseFields = (fields, formatMessage) => (
	Object.keys(fields).map((key, i) => (
		<View>
			{i === 0 && <Text style={styles.heading1}>
				{formatMessage({ id: `DiagnoseTab.tab1` })}:
			</Text>}
			{i === 9 && <Text style={styles.heading1}>
				{formatMessage({ id: `DiagnoseTab.tab2` })}:
			</Text>}
			{i === 17 && <Text style={styles.heading1}>
				{formatMessage({ id: `DiagnoseTab.tab3` })}:
			</Text>}
			{ !!fields[key] && <Text style={styles.heading2}>
				{formatMessage({ id: `DiagnoseTab.${key}` })}:
			</Text> }
			<Text style={styles.text}>{fields[key]}</Text>
		</View>
	))
);

export default renderDiagnoseFields;