import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Select } from 'antd'
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo'

import PATIENTS_LIST_QUERY from '../graphql/PatientsList.graphql'

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
