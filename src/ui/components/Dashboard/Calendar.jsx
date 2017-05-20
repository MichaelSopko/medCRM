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
import ColorHash from 'color-hash'
import { FormattedMessage } from 'react-intl'

import PATIENTS_LIST_QUERY from '../../patient/graphql/PatientsList.graphql'
import GET_TREATMENTS_QUERY from '../../graphql/TreatmentsGet.graphql'

import ROLES from '../../../helpers/constants/roles'
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import PatientSelector from '../PatientSelector'

import './Calendar.scss'

BigCalendar.momentLocalizer(moment);

const colorHash = new ColorHash();

const getColorForEvent = (event) => ({
	style: { backgroundColor: colorHash.hex(event.patient.id) }
})

const TreatmentsCalendar = ({ data: { loading, treatmentSeries = [], therapists = [] }, currentUser, currentClinic }) => {


	let events = [];
	treatmentSeries.forEach(series => {
		events.push(...series.treatments.map(t => ({ series, ...t })));
	})
	events = events.map(treatment => ({
		start: new Date(treatment.start_date),
		end: new Date(treatment.end_date),
		title: `${treatment.series.patient.first_name} ${treatment.series.patient.last_name}`,
		patient: treatment.series.patient,
	}));

	console.log(events);

	return (
		<div>
			{ currentClinic.id && <BigCalendar
				rtl={!__DEV__}
				events={events}
				eventPropGetter={getColorForEvent}
				formats={{
					eventTimeRangeFormat: ({ start, end }, culture, local) =>
					`${moment(start).format('H:mm')} — ${moment(end).format('H:mm')}`,
					agendaTimeRangeFormat: ({ start, end }, culture, local) =>
					`${moment(start).format('H:mm')} — ${moment(end).format('H:mm')}`
				}}
			  messages={{
				  allDay: <FormattedMessage id='Calendar.allDay' />,
				  previous: <FormattedMessage id='Calendar.previous' />,
				  next: <FormattedMessage id='Calendar.next' />,
				  today: <FormattedMessage id='Calendar.today' />,
				  month: <FormattedMessage id='Calendar.month' />,
				  week: <FormattedMessage id='Calendar.week' />,
				  day: <FormattedMessage id='Calendar.day' />,
				  agenda: <FormattedMessage id='Calendar.agenda' />,
			  }}
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

	state = {
		patientId: undefined
	}

	onPatientChange = id => {
		this.setState({ patientId: id });
	}

	resetFilter = () => {
		this.onPatientChange(undefined);
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
								<Checkbox style={{ marginRight: 8 }} checked={!patientId}
								          onChange={this.resetFilter}>{ formatMessage({ id: 'Calendar.show_all' }) }</Checkbox>
								<PatientSelector value={patientId} allowClear showArchived={false} onChange={this.onPatientChange} />
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