import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Select } from 'antd'
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo'
import update from 'react-addons-update'

import PATIENTS_LIST_QUERY from '../graphql/PatientsList.graphql'

import PATIENT_CREATED_SUBSCRIPTION from '../graphql/PatientCreatedSubscription.graphql'
import PATIENT_UPDATED_SUBSCRIPTION from '../graphql/PatientUpdatedSubscription.graphql'
import PATIENT_DELETED_SUBSCRIPTION from '../graphql/PatientDeletedSubscription.graphql'

@connect(
	(state) => ({ currentClinic: state.currentClinic }),
)
@graphql(PATIENTS_LIST_QUERY, {
	options: ({ currentClinic, showArchived }) => ({
		variables: { clinic_id: currentClinic.id, archived: showArchived },
	}),
	skip: ({ currentClinic }) => !(currentClinic && currentClinic.id),
})
class PatientSelector extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	componentWillReceiveProps(nextProps) {

		if (!this.props.data) return;

		const { subscribeToMore } = this.props.data;

		if (!nextProps.data.loading && nextProps.currentClinic && nextProps.currentClinic.id && (!this.subscriptions || !this.props.currentClinic || this.props.currentClinic.id !== nextProps.currentClinic.id)) {
			this.subscriptions = [
				subscribeToMore({
					document: PATIENT_CREATED_SUBSCRIPTION,
					variables: { clinic_id: nextProps.currentClinic.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						const newPatient = subscriptionData.data.patientCreated;
						const newResult = update(previousResult, {
							patients: {
								$unshift: [newPatient],
							},
						});
						return newResult;
					},
				}),];
		}

	}

	onClinicChange = id => {
		this.props.setCurrentClinic({ id });
	}

	render() {
		const { data, ...props } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		if (!data) {
			return false;
		}

		const { patients, loading } = data;

		return <Select
			autofocus
			style={{ width: 300, marginRight: 12 }}
			placeholder={ formatMessage({ id: 'PatientSelector.placeholder' }) }
			optionFilterProp="children"
			showSearch
			dropdownMatchSelectWidth={false}
			size='large'
			{ ...props }>
			{ patients && patients.map(patient => (
				<Select.Option
					key={ patient.id.toString() }
					value={ patient.id.toString() }>
					#{ patient.id_number } { patient.first_name } { patient.last_name }
				</Select.Option>
			)) }
		</Select>
	}

}

export default PatientSelector;
