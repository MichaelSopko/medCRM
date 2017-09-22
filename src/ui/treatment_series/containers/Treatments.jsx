import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import {
	Table, Icon, Button, Menu, Modal, Input, Form, Popconfirm, Select, DatePicker, InputNumber, notification, Col, Switch, Dropdown
} from 'antd'
import moment from 'moment'

import GET_TREATMENTS_QUERY from '../graphql/treatments.query.gql'

import CREATE_OBJECT_MUTATION from '../graphql/createTreatmentSeriesObject.mutation.gql'
import UPDATE_OBJECT_MUTATION from '../graphql/updateTreatmentSeriesObject.mutation.gql'
import DELETE_OBJECT_MUTATION from '../graphql/deleteTreatmentSeriesObject.mutation.gql'

import ADD_SERIES_MUTATION from '../graphql/addTreatmentSeries.mutation.gql'
import DELETE_SERIES_MUTATION from '../graphql/deleteTreatmentSeries.mutation.gql'
import EDIT_SERIES_MUTATION from '../graphql/editTreatmentSeries.mutation.gql'

import SERIES_CREATED_SUBSCRIPTION from '../graphql/treatmentSeriesCreated.subscription.gql'
import SERIES_UPDATED_SUBSCRIPTION from '../graphql/treatmentSeriesUpdated.subscription.gql'
import SERIES_DELETED_SUBSCRIPTION from '../graphql/treatmentSeriesDeleted.subscription.gql'

import ROLES from '../../../helpers/constants/roles'
import { withCurrentUser } from '../../components/helpers/withCurrentUser';
import { TreatmentForm } from '../components/TreatmentForm';
import { TreatmentSeriesForm } from '../components/TreatmentSeriesForm';
import { TreatmentObjectsTable } from '../components/TreatmentObjectsTable';

import './Treatments.scss'
import SchoolObservationForm from '../components/SchoolObservationForm';
import StaffMeetingForm from '../components/StaffMeetingForm';
import OutsideSourceConsultForm from '../components/OutsideSourceConsultForm';


export const FORM_TYPES = {
	TreatmentSeries: 'TreatmentSeries',
	SchoolObservation: 'SchoolObservation',
	Treatment: 'Treatment',
	StaffMeeting: 'StaffMeeting',
	OutsideSourceConsult: 'OutsideSourceConsult',
};

class Treatments extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};

	state = {
		currentFormType: null,
		currentObject: null,
		currentSeries: null,
		modalLoading: false,
	};

	subscriptions = null;

	componentWillReceiveProps(nextProps) {
		const { subscribeToMore } = this.props.data;

		if (!this.subscriptions && nextProps.patient) {
			this.subscriptions = [
				subscribeToMore({
					document: SERIES_CREATED_SUBSCRIPTION,
					variables: { patient_id: nextProps.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						const newSeries = subscriptionData.data.treatmentSeriesCreated;
						const newResult = update(previousResult, {
							treatmentSeries: {
								$unshift: [newSeries],
							},
						});
						return newResult;
					},
				}),
				subscribeToMore({
					document: SERIES_UPDATED_SUBSCRIPTION,
					variables: { patient_id: nextProps.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						previousResult.treatmentSeries = previousResult.treatmentSeries.map((series) => {
							if (series.id === subscriptionData.data.treatmentSeriesUpdated.id) {
								return subscriptionData.data.treatmentSeriesUpdated
							} else {
								return series
							}
						})
						return previousResult
					},
				}),
				subscribeToMore({
					document: SERIES_DELETED_SUBSCRIPTION,
					variables: { patient_id: nextProps.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						previousResult.treatmentSeries = previousResult.treatmentSeries.filter(series => series.id !== subscriptionData.data.treatmentSeriesDeleted.id)
						return previousResult
					},
				})];
		}
	}

	handleOk = () => {
		this.setState({ seriesModalOpened: false, treatmentModalOpened: false });
		this.resetActiveEntity();
	};

	handleCancel = () => {
		this.setState({ seriesModalOpened: false, treatmentModalOpened: false });
		this.resetActiveEntity();
	};

	updateObject = (object) => {
		this.showForm(FORM_TYPES[object.__typename], null, object);
	}

	showForm = (currentFormType, currentSeries = null, currentObject = null) => {
		this.setState({
			currentFormType, currentObject, currentSeries,
		});
	};

	hideForm = () => {
		this.setState({
			currentFormType: null, currentObject: null, currentSeries: null, modalLoading: false,
		});
	};

	handleSubmit = async (form, values) => {
			const { currentFormType, currentSeries, currentObject } = this.state;
			let mutation, params, isNew;
			if (currentFormType === FORM_TYPES.TreatmentSeries) {
				isNew = !currentSeries;
				mutation = isNew ? this.props.addSeries : this.props.editSeries;
				values.start_date = moment(values.start_date).toISOString();
				values.end_date = moment(values.end_date).toISOString();
				params = isNew
				? { patient_id: this.props.patient.id, clinic_id: this.props.currentClinic.id, ...values  }
				: values;
			} else {
				isNew = !currentObject;
				if (values.repeat_weeks_trigger !== undefined) {
					delete values.repeat_weeks_trigger;
				}
				mutation = isNew ? this.props.createObject : this.props.updateObject;
				params = isNew
					? { series_id: currentSeries.id, object: { [`${currentFormType}Input`]: values } }
					: { id: currentObject.id, object: { [`${currentFormType}Input`]: values } };
			}
			try {
				this.setState({ modalLoading: true });
				console.log('Running form', params);
				await mutation(params);
				this.hideForm();
				form.resetFields();
			} catch (error) {
				this.setState({ modalLoading: false });
				console.error(error);
				let id = 'common.server_error';
				if (error.graphQLErrors) {
					id = error.graphQLErrors[0].message;
				}
				notification.error({
					message: this.context.intl.formatMessage({ id }),
				});
			}
	}

	render() {
		const {
			data: { loading, treatmentSeries = [], therapists = [] },
			currentClinic, deleteSeries, currentUser, patient, deleteObject,
		} = this.props;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			dataIndex: 'name',
			sorter: (a, b) => a.name > b.name,
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic">{ text }</span>
			</div>,
			width: '20%',
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.past_treatments' }),
			key: 'past_treatments',
			sorter: true,
			width: '10%',
			render: (_, record) => record.objects.filter(obj => obj.__typename === 'Treatment' && moment(obj.start_date).valueOf() < moment().valueOf()).length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.future_treatments' }),
			key: 'future_treatments',
			sorter: true,
			width: '10%',
			render: (_, record) => record.objects.filter(obj => obj.__typename === 'Treatment' && moment(obj.start_date).valueOf() >= moment().valueOf()).length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.total_treatments' }),
			key: 'total_treatments',
			sorter: true,
			width: '10%',
			render: (_, record) => record.objects.filter(obj => obj.__typename === 'Treatment').length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.school_observations' }),
			key: 'school_observations',
			sorter: true,
			width: '10%',
			render: (_, record) => record.objects.filter(obj => obj.__typename === 'SchoolObservation').length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.staff_meetings' }),
			key: 'staff_meetings',
			sorter: true,
			width: '10%',
			render: (_, record) => record.objects.filter(obj => obj.__typename === 'StaffMeeting').length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.outside_source_consults' }),
			key: 'outside_source_consults',
			sorter: true,
			width: '10%',
			render: (_, record) => record.objects.filter(obj => obj.__typename === 'OutsideSourceConsult').length,
		}/*, {
			title: formatMessage({ id: 'Treatments.field_treatments_number' }),
			key: 'treatments_number',
			dataIndex: 'treatments_number',
			sorter: (a, b) => a.treatments_number > b.treatments_number,
			width: '35%',
		}*/, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '20%',
			render: (text, record) => (
				<span>
					<Dropdown.Button
						type='primary'
						onClick={() => this.showForm(FORM_TYPES.Treatment, record)}
						size='small'
						disabled={patient.archived}
						overlay={
						<Menu onClick={({ key }) => this.showForm(FORM_TYPES[key], record)}>
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
					<span className='ant-divider' />
		      <Button size="small" type='ghost' onClick={ () => this.showForm(FORM_TYPES.TreatmentSeries, record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className='ant-divider' />
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deleteSeries(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })}
		                  cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size='small' type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
		        </Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { currentFormType, currentObject, currentSeries, modalLoading, } = this.state;
		const formProps = {
			loading: modalLoading,
			onCancel: this.hideForm,
			onSubmit: this.handleSubmit,
			formatMessage,
			currentUser,
			currentClinic,
			therapists,
		};

		return (
			<section className="Treatments">
				<TreatmentSeriesForm
					visible={currentFormType === FORM_TYPES.TreatmentSeries}
					isNew={!currentSeries}
					values={currentSeries}
					{...formProps}
				/>
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
				<div className="Dashboard__Details" style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<div className="Dashboard__Actions">
						<Button type="primary" size='small' onClick={ () => this.showForm(FORM_TYPES.TreatmentSeries) } disabled={ !currentClinic.id || patient.archived }>
							<Icon type="plus-circle-o" />
							{ formatMessage({ id: 'Treatments.create_series_button' }) }
						</Button>
					</div>
				</div>
				<Table
					expandedRowRender={record => <TreatmentObjectsTable
						treatments={record.objects}
						updateObject={this.updateObject}
						formatMessage={formatMessage}
						deleteObject={deleteObject} />
					}
					dataSource={treatmentSeries}
					columns={columns}
					loading={loading}
					rowKey='id' />
			</section>
		);
	}
}

const getOptions = name => ({
	props: ({ ownProps, mutate }) => ({
		[name]: (fields) => mutate({
			variables: fields,
			refetchQueries: [/*{
			 query: GET_TREATMENTS_QUERY,
			 variables: {
			 clinic_id: ownProps.currentClinic.id
			 }
			 }*/],
		}),
	}),
});

const TreatmentsWithApollo = withApollo(compose(
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(GET_TREATMENTS_QUERY, {
		options: ({ patient, currentClinic }) => ({
			variables: {
				patient_id: +patient.id,
				clinic_id: currentClinic.id,
			},
		}),
	}),
	graphql(ADD_SERIES_MUTATION, getOptions('addSeries')),
	graphql(DELETE_SERIES_MUTATION, {
		props: ({ ownProps: { patient, currentClinic }, mutate }) => ({
			deleteSeries: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_TREATMENTS_QUERY,
					variables: patient ? { patient_id: +patient.id, clinic_id: null } : {
						patient_id: null,
						clinic_id: currentClinic.id,
					},
				}],
			}),
		}),
	}),
	graphql(EDIT_SERIES_MUTATION, getOptions('editSeries')),
	graphql(CREATE_OBJECT_MUTATION, getOptions('createObject')),
	graphql(UPDATE_OBJECT_MUTATION, getOptions('updateObject')),
	graphql(DELETE_OBJECT_MUTATION, {
		props: ({ ownProps: { patient, currentClinic }, mutate }) => ({
			deleteObject: ({ id, __typename }) => mutate({
				variables: { id, __typename },
				refetchQueries: [{
					query: GET_TREATMENTS_QUERY,
					variables: patient ? { patient_id: +patient.id, clinic_id: null } : {
						patient_id: null,
						clinic_id: currentClinic.id,
					},
				}],
			}),
		}),
	}),
	// withCurrentUser
)(Treatments));

export default TreatmentsWithApollo;
