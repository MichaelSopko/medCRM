import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Select } from 'antd'
import gql from 'graphql-tag';
import { graphql } from 'react-apollo'


import GET_CLINICS_QUERY from '../graphql/ClinicsGet.graphql'

@graphql(GET_CLINICS_QUERY)
@connect(
	(state) => ({ currentClinic: state.currentClinic }),
	(dispatch) => ({
		setCurrentClinic(clinic)
		{
			dispatch({
				type: 'SET_CLINIC',
				clinic
			});
		}
	})
)
class ClinicSelector extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired
	};

	onClinicChange = id => {
		this.props.setCurrentClinic(this.props.data.clinics.find(c => c.id === id));
	}

	render() {
		const { currentClinic: { id }, data: { clinics, loading } } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		return <Select
			style={{ width: 250, marginRight: 12 }}
			value={ id }
			onChange={this.onClinicChange}
			placeholder={ formatMessage({ id: 'ClinicsSelector.placeholder' }) }
			optionFilterProp="children"
			showSearch>
			{ clinics && clinics.map(clinic => <Select.Option key={ clinic.id } value={ clinic.id }>{ clinic.name }</Select.Option>) }
		</Select>
	}

}

export default ClinicSelector;
