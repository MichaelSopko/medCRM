import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { FormattedMessage } from 'react-intl';
import { Spin, Row, Col, Input, Tabs, Form } from 'antd';
// import { Document } from '@react-pdf/dom';

// import PatientObjectView from '../components/PatientObjectView';
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

	render() {
		const { params: { patient_id, object_id }, data: { patient, error, loading } } = this.props;
		const object = patient ? (patient.diagnoses.find(d => d.id == object_id) || patient.treatment_summary.find(d => d.id == object_id)) : {};

		return (
			<main className='PatientObjectPrintPage'>
				<Document>
					<PatientObjectView
						patient={patient}
						object={object}
						renderFields={object.__typename === 'Diagnose' ? this.renderDiagnoseFields : this.renderTreatmentFields}
						loading={loading}
						formatMessage={this.context.intl.formatMessage}
					/>
				</Document>
			</main>
		);
	}
}

export default PatientObjectPrintPage;
