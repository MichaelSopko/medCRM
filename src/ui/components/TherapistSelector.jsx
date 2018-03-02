import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

import { connect } from 'react-redux';
// import { graphql, compose } from 'react-apollo';
// import update from 'react-addons-update';
//
// import PATIENTS_LIST_QUERY from '../patient/graphql/PatientsList.graphql'
//
// @connect(
// 	(state) => ({ currentClinic: state.currentClinic }),
// )
class TherapistSelector extends Component {
	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};
	
	onClinicChange = id => {
		this.props.setCurrentClinic({ id });
	};
	
	render() {
		const { data, ...props } = this.props;
		const formatMessage = this.context.intl.formatMessage;
		
		console.log(data);
		
		if (!data) {
			return false;
		}
		
		const { therapists, loading } = data;
		
		return (
			<Select
				autofocus
				style={{ width: 300, marginRight: 12 }}
				placeholder={ formatMessage({ id: 'Treatments.field_therapists' }) }
				optionFilterProp="children"
				showSearch
				dropdownMatchSelectWidth={false}
				size="large"
				{...props}
			>
				{ therapists && therapists.map(therapist => (
					<Select.Option
						key={therapist.id}
						value={therapist.id}
					>
						#{ therapist.id_number } { therapist.first_name } { therapist.last_name }
					</Select.Option>
				)) }
			</Select>
		);
	}
}

export default TherapistSelector;