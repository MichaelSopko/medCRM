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
	Icon,
	Checkbox,
	notification,
	Dropdown,
	Menu,
	Spin,
} from 'antd';
import ColorHash from 'color-hash';
import { FormattedMessage } from 'react-intl';

import PATIENTS_LIST_QUERY from '../../patient/graphql/PatientsList.graphql';
import GET_TREATMENTS_QUERY from '../../treatment_series/graphql/treatments.query.gql';
import UPDATE_OBJECT_MUTATION from '../../treatment_series/graphql/updateTreatmentSeriesObject.mutation.gql';
import MUTATION_ADD_TREATMENT from '../../treatment_series/graphql/TreatmentAddMutation.graphql';
import MUTATION_EDIT_TREATMENT from '../../treatment_series/graphql/TreatmentEditMutation.graphql';

import ROLES from '../../../helpers/constants/roles';
import ClinicsSelector from '../ClinicsSelector';
import CheckAccess from '../helpers/CheckAccess';
import PatientSelector from '../PatientSelector';
import {TreatmentForm} from '../../treatment_series/components/TreatmentForm';
import SchoolObservationForm from '../../treatment_series/components/SchoolObservationForm';
import StaffMeetingForm from '../../treatment_series/components/StaffMeetingForm';
import OutsideSourceConsultForm from '../../treatment_series/components/OutsideSourceConsultForm';

import TherapistSelector from '../TherapistSelector';

import './Calendar.scss';

BigCalendar.momentLocalizer(moment);

const colorHash = new ColorHash();


const DragAndDropCalendar = withDragAndDrop(BigCalendar);

export const FORM_TYPES = {
	TreatmentSeries: 'TreatmentSeries',
	SchoolObservation: 'SchoolObservation',
	Treatment: 'Treatment',
	StaffMeeting: 'StaffMeeting',
	OutsideSourceConsult: 'OutsideSourceConsult',
};

@DragDropContext(HTML5Backend)
class TreatmentsCalendar extends Component {

	static contextTypes = {
		intl: PropTypes.object,
	};
	
	state = {
		currentTreatment: null,
		currentFormType: null,
		currentObject: null,
		currentSeries: null,
		modalLoading: false,
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
	
	eventClick = (calEvent) => {
		console.log(calEvent);
		console.log(FORM_TYPES.Treatment);
		this.showForm(calEvent.treatment.__typename, null, calEvent.treatment);
	};

	handleCancel = () => {
		setTimeout(() => {
			this.setState({
				currentTreatment: null, currentFormType: null, currentObject: null, currentSeries: null, modalLoading: false,
			});
			this.treatmentForm && this.treatmentForm.resetFields();
		}, 300);
	};
	
	handleSubmit = (form, values) => {
		const { currentFormType, currentSeries, currentObject, patient } = this.state;
		const isNew = !currentObject;
		let mutation;
		let params;
		
		if (values.repeat_weeks_trigger !== undefined) {
			delete values.repeat_weeks_trigger;
		}
		
		console.log( this.state);
		
		mutation = isNew ? this.props.createObject : this.props.updateObject;
		
		params = isNew
			? {
				// series_id: currentSeries ? currentSeries.id : 1,
				object: { [`${currentFormType}Input`]: values },
				patient_id: this.props.patientId,
				clinic_id: +this.props.currentClinic.id,
			}
			: {
				id: currentObject.id,
				object: { [`${currentFormType}Input`]: values }
			};
		
		
		this.setState({ modalLoading: true });
		
		console.log('Running form', params);
		
		mutation(params).then((res) => {
			this.handleCancel();
			form.resetFields();
			this.props.data.refetch();
		}).catch(error => {
			this.setState({modalLoading: false});
			console.error(error);
			let id = 'common.server_error';
			if (error.graphQLErrors) {
				id = error.graphQLErrors[0].message;
			}
			notification.error({
				message: this.context.intl.formatMessage({id}),
			});
		});
	};
	
	showForm = (currentFormType, currentSeries = null, currentObject = null) => {
		this.setState({
			currentFormType, currentObject, currentSeries,
		});
	};
	
	onTherapistChange = id => {
		this.props.onTherapistChange(id);
		this.props.data.refetch();
	};
	
	
	componentWillReceiveProps(nextProps){
		console.log('nextProps');
		console.log(nextProps);
	}

	render() {
		const {
			data: {
				loading, treatmentSeries, therapists = [], treatmentsList = [], treatmentObjects = []
			}, currentUser, currentClinic,
		} = this.props;
		const { currentTreatment, modalLoading, currentFormType, currentObject, currentSeries } = this.state;
		const formatMessage = this.context.intl.formatMessage;
		const formProps = {
			loading: modalLoading,
			onCancel: this.handleCancel,
			onSubmit: this.handleSubmit.bind(this),
			formatMessage,
			currentUser,
			currentClinic,
			therapists,
		};

		if (!currentClinic.id) return null;
		
		console.log(treatmentObjects);
		
		let events = treatmentsList.concat(treatmentObjects).filter(obj => obj.patient);
		
		events = events.map(treatment => {
			const startDate = new Date(treatment.start_date || treatment.date);
			const userTimezoneOffset = startDate.getTimezoneOffset() * 60000;
			const endDate = new Date(treatment.end_date || treatment.date);
			return {
				start: new Date(startDate.getTime() + userTimezoneOffset),
				end: new Date(endDate.getTime() + userTimezoneOffset),
				title: `${treatment.__typename} ${treatment.patient.first_name} ${treatment.patient.last_name} (${moment(startDate).format('H:mm')} — ${moment(endDate).format('H:mm')})`,
				patient: treatment.patient,
				id: treatment.id,
				// allDay: true,
				treatment,
			};
		});
		
		return (
			<div className="calendar-wrap">
				<TreatmentForm
					visible={currentFormType === FORM_TYPES.Treatment}
					isNew={!currentObject}
					values={currentObject}
					{...formProps}
				/>
				<SchoolObservationForm
					visible={currentFormType === FORM_TYPES.SchoolObservation}
					isNew={!currentObject}
					values={currentObject}
					{...formProps}
				/>
				<StaffMeetingForm
					visible={currentFormType === FORM_TYPES.StaffMeeting}
					isNew={!currentObject}
					values={currentObject}
					{...formProps}
				/>
				<OutsideSourceConsultForm
					visible={currentFormType === FORM_TYPES.OutsideSourceConsult}
					isNew={!currentObject}
					values={currentObject}
					{...formProps}
				/>
				<Spin spinning={loading}>
					<div className="treatment-btns-wrap">
						<div className="Dashboard__Actions PatientObjectTab__Actions">
							{(currentUser.role === ROLES.SYSTEM_ADMIN || currentUser.role === ROLES.CLINIC_ADMIN) && <TherapistSelector
								value={this.props.therapistId}
								data={{therapists, loading}}
								allowClear showArchived={false}
								onChange={this.onTherapistChange}
							/>}
							
							<Dropdown.Button
								type='primary'
								onClick={() => this.showForm(FORM_TYPES.Treatment)}
								size='small'
								disabled={!this.props.patientId}
								overlay={
									<Menu onClick={({ key }) => this.showForm(FORM_TYPES[key])}>
										<Menu.Item key={FORM_TYPES.SchoolObservation}>
											<Icon type='plus-circle-o' style={{marginLeft: 6, marginRight: 6 }} />
											{formatMessage({ id: 'Treatments.create_object_button.school_observation' })}
										</Menu.Item>
										<Menu.Item key={FORM_TYPES.StaffMeeting}>
											<Icon type='plus-circle-o' style={{marginLeft: 6, marginRight: 6 }} />
											{formatMessage({ id: 'Treatments.create_object_button.staff_meeting' })}
										</Menu.Item>
										<Menu.Item key={FORM_TYPES.OutsideSourceConsult}>
											<Icon type='plus-circle-o' style={{marginLeft: 6, marginRight: 6 }} />
											{formatMessage({ id: 'Treatments.create_object_button.outside_source_consult' })}
										</Menu.Item>
									</Menu>
								}>
								<Icon type='plus-circle-o' />
								{formatMessage({ id: 'Treatments.create_object_button.treatment' })}
							</Dropdown.Button>
						</div>
					</div>
					<FullCalendar
						isRTL={!__DEV__}
						id="ghjk"
						header = {{
							left: 'prev,next today, month, basicWeek, basicDay,' +
							' agenda',
							center: 'title',
							right: ''
						}}
						events={events}
						buttonText={{
							allDay: formatMessage({id: 'Calendar.allDay'}),
							// prev: formatMessage({id: 'Calendar.previous'}),
							// next: formatMessage({id: 'Calendar.next'}),
							today: formatMessage({id: 'Calendar.today'}),
							month: formatMessage({id: 'Calendar.month'}),
							week: formatMessage({id: 'Calendar.week'}),
							day: formatMessage({id: 'Calendar.day'}),
							agenda: formatMessage({id: 'Calendar.agenda'}),
						}}
						navLinks={true} // can click day/week names to navigate views
						editable={true}
						eventClick={this.eventClick}
					/>
				</Spin>
			</div>
		);
	}
}

const getOptions = name => ({
	props: ({ ownProps, mutate }) => ({
		[name]: (fields) => mutate({
			variables: fields,
			refetchQueries: [{
				query: GET_TREATMENTS_QUERY,
				variables: ownProps.therapistId ?
					{ therapist_id: +ownProps.therapistId, patient_id: null, clinic_id: ownProps.currentClinic.id } :
					(ownProps.patientId ? { therapist_id: null, patient_id: +ownProps.patientId, clinic_id: ownProps.currentClinic.id } : {
						therapist_id: null,
						patient_id: null,
						clinic_id: ownProps.currentClinic.id
					}),
			}],
		}),
	}),
});
const TreatmentsCalendarWithData = compose(
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(GET_TREATMENTS_QUERY, {
		options: ({ currentClinic, patientId, therapistId }) => ({
			variables: therapistId ?
				{ therapist_id: +therapistId, patient_id: null, clinic_id: currentClinic.id } :
				(patientId ? { therapist_id: null, patient_id: +patientId, clinic_id: currentClinic.id } : {
					therapist_id: null,
					patient_id: null,
					clinic_id: currentClinic.id
				}),
		}),
		skip: ({ currentClinic, patientId }) => !currentClinic,
	}),
	graphql(MUTATION_ADD_TREATMENT, getOptions('createObject')),
	graphql(MUTATION_EDIT_TREATMENT, getOptions('updateObject')),
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
		therapistId: undefined,
	};

	onPatientChange = id => {
		this.setState({ patientId: id });
	};
	
	onTherapistChange = id => {
		this.setState({ therapistId: id });
	};

	resetFilter = () => {
		this.onPatientChange(undefined);
	};

	render() {
		const formatMessage = this.context.intl.formatMessage;
		const { patientId, therapistId } = this.state;

		return (
			<section className='Calendar'>
				<div className='Container Dashboard__Content Calendar__Content'>
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

					<TreatmentsCalendarWithData patientId={patientId}
												therapistId={therapistId}
												onTherapistChange={this.onTherapistChange.bind(this)} />
				</div>
			</section>
		);
	}
}

export default Calendar;
