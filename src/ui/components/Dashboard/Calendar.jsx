import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import moment from 'moment'
import BigCalendar from 'react-big-calendar'
import {
	Table,
	Icon,
	Button,
	Modal,
	Input,
	Form,
	Row,
	Col,
	Popconfirm,
	Select,
	DatePicker,
	Upload,
	Checkbox,
	notification,
	message,
} from 'antd'


import PATIENTS_LIST_QUERY from '../../graphql/PatientsList.graphql'
import GET_TREATMENTS_QUERY from '../../graphql/TreatmentsGet.graphql'

import ROLES from '../../../helpers/constants/roles'
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import PatientSelector from '../PatientSelector'

import './Calendar.scss'

require('globalize/lib/cultures/globalize.culture.he');


BigCalendar.momentLocalizer(moment);

const TreatmentsCalendar = ({ data: { loading, treatmentSeries = [], therapists = [] }, currentUser, currentClinic }) => {

	console.log(treatmentSeries);

	let events = [];
	treatmentSeries.forEach(series => {
		events.push(...series.treatments.map(t => ({ series, ...t })));
	})
	events = events.map(treatment => ({
		start: new Date(treatment.start_date),
		end: new Date(treatment.end_date),
		title: treatment.series.name,
	}));


	return (
		<div>
			{ currentClinic.id && <BigCalendar
				culture={__DEV__ ? 'en' : 'he'}
				rtl={!__DEV__}
				events={events}
			/> }
		</div>
	);
}

const TreatmentsCalendarWithData = compose(
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(GET_TREATMENTS_QUERY, {
		options: ({ currentClinic, patientId }) => ({
			variables: patientId ? { patient_id: +patientId, clinic_id: null } : { patient_id: null, clinic_id: currentClinic.id },
		}),
		skip: ({ currentClinic, patientId }) => !currentClinic && !patientId,
	})
)(TreatmentsCalendar);

class Calendar extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};

	state = {}

	onPatientChange = id => {
		this.setState({ patientId: id });
	}

	render() {
		const formatMessage = this.context.intl.formatMessage;
		const { patientId } = this.state;

		return (
			<section className="Calendar">
				<div className="Container Dashboard__Content">
					<div className="Dashboard__Details">
						<h1 className="Dashboard__Header">
							{ formatMessage({ id: 'Calendar.header' }) }
						</h1>
						<div className="Dashboard__Actions">
							<div>
								<PatientSelector allowClear showArchived={false} onChange={this.onPatientChange} />
							</div>
							<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
								<ClinicsSelector />
							</CheckAccess>
						</div>
					</div>

					<TreatmentsCalendarWithData patientId={patientId} />
				</div>
			</section>
		);
	}
}

export default Calendar;