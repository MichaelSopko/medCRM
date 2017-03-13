import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Select } from 'antd'
import gql from 'graphql-tag';
import { graphql } from 'react-apollo'

@graphql(gql`
    query clinics {
        clinics {
		    	id
		    	name
    	}
    }
`)
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
		this.props.setCurrentClinic({ id });
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
			{ clinics && clinics.map(clinic => <Select.Option key={ clinic.id.toString() } value={ clinic.id.toString() }>{ clinic.name }</Select.Option>) }
		</Select>
	}

}

export default ClinicSelector;
