import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import update from 'react-addons-update';
// import $ from 'jquery';
import moment from 'moment';
import BigCalendar from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import FullCalendar from './fullcalendar';

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
	Spin
} from 'antd'
import ColorHash from 'color-hash'
import { FormattedMessage } from 'react-intl'

import PATIENTS_LIST_QUERY from '../../patient/graphql/PatientsList.graphql'
import GET_TREATMENTS_QUERY from '../../treatment_series/graphql/treatments.query.gql'
import UPDATE_OBJECT_MUTATION from '../../treatment_series/graphql/updateTreatmentSeriesObject.mutation.gql'

import ROLES from '../../../helpers/constants/roles'
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import PatientSelector from '../PatientSelector'
import {TreatmentForm} from '../../treatment_series/components/TreatmentForm';

import './Calendar.scss'

BigCalendar.momentLocalizer(moment);

const colorHash = new ColorHash();


const DragAndDropCalendar = withDragAndDrop(BigCalendar);

@DragDropContext(HTML5Backend)
class TreatmentsCalendar extends Component {

	static contextTypes = {
		intl: PropTypes.object,
	};

	state = {
		currentTreatment: null,
	};

	componentWillMount() {
		if (this.props.data && !this.props.data.loading) {
			this.props.data.refetch();
		}
	}

	moveEvent = ({ event, start, end }) => {
		const formatMessage = this.context.intl.formatMessage;
		const errorHandler = e => {
			console.error(e);
			let id = 'common.server_error';
			if (e.graphQLErrors) {
				id = e.graphQLErrors[0].message;
			}
			notification.error({
				message: formatMessage({ id }),
			});
		};

		this.props.mutate({ variables: {
			id: event.id,
			object: {
				TreatmentInput: {
					start_date: start,
					end_date: end,
				},
			},
		}}).catch(errorHandler);
	};

	editTreatment = (e) => {
		this.setState({ currentTreatment: e.treatment });
	};

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
			if (e.graphQLErrors) {
				id = e.graphQLErrors[0].message;
			}
			notification.error({
				message: formatMessage({ id }),
			});
		};
		form.validateFields((err, { repeat_weeks_trigger, ...values }) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			this.props.mutate({ variables: { id: this.state.currentTreatment.id, object: { TreatmentInput: values } }}).then(() => {
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
			if (series.objects) {
				events.push(...series.objects.filter(obj => obj.__typename === 'Treatment').map(t => ({ series, ...t })));
			}
		});
		events = events.map(treatment => {
			const startDate = new Date(treatment.start_date);
			const userTimezoneOffset = startDate.getTimezoneOffset() * 60000;
			const endDate = new Date(treatment.end_date);
			return {
				start: new Date(startDate.getTime()),
				end: new Date(endDate.getTime()),
				title: `${treatment.series.patient.first_name} ${treatment.series.patient.last_name} (${moment(startDate).format('H:mm')} — ${moment(endDate).format('H:mm')})`,
				patient: treatment.series.patient,
				id: treatment.id,
				treatment,
			};
		});
		const getProps = (event) => ({
			style: { backgroundColor: colorHash.hex(event && event.patient.id) },
		});
		
		const calendarOptions = {};

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
				<Spin spinning={loading}>
					{/*
					<DragAndDropCalendar
						rtl={!__DEV__}
						events={events}
						eventPropGetter={getProps}
						onEventDrop={this.moveEvent}
						selectable
						onSelectEvent={this.editTreatment}
						formats={{
							eventTimeRangeFormat: ({ start, end }, culture, local) =>
							agendaTimeRangeFormat: ({ start, end }, culture, local) =>
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
					*/}
					<FullCalendar
						isRTL={!__DEV__}
						id="ghjk"
						header = {{
							left: 'prev,next today myCustomButton, agenda',
							center: 'title',
							right: 'month,basicWeek,basicDay'
						}}
						events={events}
						buttonText={{
							allDay: formatMessage({id: 'Calendar.allDay'}),
							prev: formatMessage({id: 'Calendar.previous'}),
							next: formatMessage({id: 'Calendar.next'}),
							today: formatMessage({id: 'Calendar.today'}),
							month: formatMessage({id: 'Calendar.month'}),
							week: formatMessage({id: 'Calendar.week'}),
							day: formatMessage({id: 'Calendar.day'}),
							agenda: formatMessage({id: 'Calendar.agenda'}),
						}}
						navLinks={true} // can click day/week names to navigate views
						editable={true}
					/>
					
					{/*<FullCalendar options={calendarOptions} />*/}
				</Spin>
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
	graphql(UPDATE_OBJECT_MUTATION),
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
