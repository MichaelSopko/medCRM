import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import moment from 'moment'
import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
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
import EDIT_TREATMENT_MUTATION from '../../graphql/TreatmentEditMutation.graphql'
import {TreatmentForm} from '../Treatments';

import './Calendar.scss'

BigCalendar.momentLocalizer(moment);

const colorHash = new ColorHash();


const DragAndDropCalendar = withDragAndDrop(BigCalendar);

@DragDropContext(HTML5Backend)
class TreatmentsCalendar extends Component {

	static contextTypes = {
		intl: PropTypes.object,
	}

	state = {
		currentTreatment: null,
	}

	moveEvent = ({ event, start, end }) => {
		this.props.mutate({
			variables: {
				id: event.id,
				treatment: {
					start_date: start, end_date: end,
				},
			},
		})
	}

	editTreatment = (e) => {
		this.setState({ currentTreatment: e.treatment });
	}

	handleCancel = () => {
		setTimeout(() => {
			this.setState({ currentTreatment: null });
			this.treatmentForm.resetFields();
		}, 300);
	};

	handleTreatmentSubmit = () => {
		const form = this.treatmentForm;
		const formatMessage = this.context.intl.formatMessage;
		const errorHandler = e => {
			this.setState({ modalLoading: false });
			console.error(e);
			let id = 'common.server_error';
			notification.error({
				message: formatMessage({ id }),
			});
		};
		form.validateFields((err, { repeat_weeks_trigger, ...values }) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			this.props.mutate({ variables: { id: this.state.currentTreatment.id, treatment: values }}).then(() => {
				form.resetFields();
				this.setState({ modalLoading: false, currentTreatment: null });
			}).catch(errorHandler);
		});
	};

	render() {
		const { data: { loading, treatmentSeries, therapists = [] }, currentUser, currentClinic } = this.props;
		const { currentTreatment, modalLoading } = this.state;
		const formatMessage = this.context.intl.formatMessage;

		if (!currentClinic.id || !treatmentSeries) return null;


		let events = [];
		treatmentSeries.forEach(series => {
			events.push(...series.treatments.map(t => ({ series, ...t })));
		})
		events = events.map(treatment => ({
			start: new Date(treatment.start_date),
			end: new Date(treatment.end_date),
			title: `${treatment.series.patient.first_name} ${treatment.series.patient.last_name} (${moment(treatment.end_date).format('H:mm')} — ${moment(treatment.start_date).format('H:mm')})`,
			patient: treatment.series.patient,
			id: treatment.id,
			treatment,
		}));

		const getProps = (event) => ({
			style: { backgroundColor: colorHash.hex(event && event.patient.id) },
		});

		return (
			<div>
				<TreatmentForm
					ref={form => {
						this.treatmentForm = form
					}}
					visible={!!currentTreatment}
					loading={modalLoading}
					onCancel={this.handleCancel}
					onSubmit={this.handleTreatmentSubmit}
					values={currentTreatment || {}}
					therapists={therapists}
					formatMessage={formatMessage}
					currentUser={currentUser}
					currentClinic={currentClinic}
				/>
				<DragAndDropCalendar
					rtl={!__DEV__}
					events={events}
					eventPropGetter={getProps}
					onEventDrop={this.moveEvent}
					selectable
					onSelectEvent={this.editTreatment}
					formats={{
						eventTimeRangeFormat: ({ start, end }, culture, local) =>
							/*`${moment(start).format('H:mm')} — ${moment(end).format('H:mm')}`*/ '',
						agendaTimeRangeFormat: ({ start, end }, culture, local) =>
							/*`${moment(start).format('H:mm')} — ${moment(end).format('H:mm')}`*/ '',
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
				/>
			</div>
		);
	}
}

const TreatmentsCalendarWithData = compose(
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(GET_TREATMENTS_QUERY, {
		options: ({ currentClinic, patientId }) => ({
			variables: patientId ? { patient_id: +patientId, clinic_id: null } : {
				patient_id: null,
				clinic_id: currentClinic.id,
			},
		}),
		skip: ({ currentClinic, patientId }) => !currentClinic && !patientId,
	}),
	graphql(EDIT_TREATMENT_MUTATION),
)(TreatmentsCalendar);

class Calendar extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};

	state = {
		patientId: undefined,
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
			<section className='Calendar'>
				<div className='Container Dashboard__Content'>
					<div className='Dashboard__Details'>
						<h1 className='Dashboard__Header'>
							{formatMessage({ id: 'Calendar.header' })}
						</h1>
						<div className='Dashboard__Actions'>
							<div>
								<Checkbox style={{ marginRight: 8 }} checked={!patientId}
								          onChange={this.resetFilter}>{formatMessage({ id: 'Calendar.show_all' })}</Checkbox>
								<PatientSelector value={patientId} allowClear showArchived={false} onChange={this.onPatientChange} />
							</div>
							<CheckAccess role={ROLES.SYSTEM_ADMIN}>
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
