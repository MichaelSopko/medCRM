import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { FormattedMessage } from 'react-intl';
import { Spin, Row, Col, Input, Tabs, Form } from 'antd';

import PatientObjectView from '../components/PatientObjectView';
import GET_PATIENT_QUERY from '../graphql/PatientGet.graphql';

@graphql(GET_PATIENT_QUERY, {
	options: ({ params }) => ({
		variables: { id: params.patient_id },
	}),
})
class PatientObjectPrintPage extends Component {

	static propTypes = {};

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	}

	componentWillReceiveProps(newProps) {
		if (newProps.data && newProps.data.patient && !newProps.data.loading && !this.printed) {
			setTimeout(() => {
				window.print();
			}, 1000);
			this.printed = true;
		}
	}

	renderTreatmentFields = (fields) => {
		return fields && (
				<Col style={{ margin: 12 }}>
					{Object.keys(fields).map(key => fields[key] && (
						<div style={{ marginTop: 12 }}>
							<h4>
								<FormattedMessage id={`TreatmentSummaryTab.${key}`} />
							</h4>
							<p>{fields[key]}</p>
						</div>
					))}
				</Col>
			);
	}

	renderDiagnoseFields = (fields) => {
		return fields && (
				<Col style={{ margin: 12 }}>
					{Object.keys(fields).map((key, i) => (
						<div style={{ marginTop: 12 }}>
							{ i === 0 && <h3>
								<FormattedMessage id={`DiagnoseTab.tab1`} />:
							</h3> }
							{ i === 9 && <h3>
								<FormattedMessage id={`DiagnoseTab.tab2`} />:
							</h3> }
							{ i === 17 && <h3>
								<FormattedMessage id={`DiagnoseTab.tab3`} />:
							</h3> }
							<h4>
								<FormattedMessage id={`DiagnoseTab.${key}`} />:
							</h4>
							<p>{fields[key] || <span style={{ fontStyle: 'italic' }}>
								<FormattedMessage id={`Patients.field_empty`} />
							</span>}</p>
						</div>
					))}
				</Col>
			);
	}

	render() {
		const { params: { patient_id, object_id }, data: { patient, error, loading } } = this.props;
		const object = patient ? (patient.diagnoses.find(d => d.id == object_id) || patient.treatment_summary.find(d => d.id == object_id)) : {};

		return (
			<main className='PatientObjectPrintPage'>
				<div className="Container">
					<PatientObjectView
						patient={patient}
						object={object}
						renderFields={object.__typename === 'Diagnose' ? this.renderDiagnoseFields : this.renderTreatmentFields}
						loading={loading}
					/>
				</div>
			</main>
		);
	}
}

export default PatientObjectPrintPage;