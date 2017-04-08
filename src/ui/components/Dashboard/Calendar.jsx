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

import './Calendar.scss'

BigCalendar.momentLocalizer(moment);


@connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser }))
@graphql(GET_TREATMENTS_QUERY, {
	options: ({ currentClinic }) => ({
		variables: { clinic_id: currentClinic.id },
	}),
	skip: ({ currentClinic }) => !currentClinic,
})
class Calendar extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};



	render() {
		const {
			data: { loading, treatmentSeries = [], therapists = [] },
			currentUser,
			currentClinic
		} = this.props;
		const formatMessage = this.context.intl.formatMessage;

		let events = [];
		treatmentSeries.forEach(series => {
			events.push(...series.treatments.map(t => ({ series, ...t })));
		})
		events = events.map(treatment => ({
			start: moment(treatment.start_date),
			end: moment(treatment.end_date),
			title: treatment.series.name,
		}));

		console.log(events);

		return (
			<section className="Calendar">
				<div className="Container Dashboard__Content">
					<div className="Dashboard__Details">
						<h1 className="Dashboard__Header">
							{ formatMessage({ id: 'Calendar.header' }) }
						</h1>
						<div className="Dashboard__Actions">
							<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
								<ClinicsSelector />
							</CheckAccess>
						</div>
					</div>

					<div>
						{ currentClinic.id && <BigCalendar
							events={events}
						/> }
					</div>
				</div>
			</section>
		);
	}
}

export default Calendar;