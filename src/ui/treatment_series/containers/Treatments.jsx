import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import update from 'react-addons-update';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import {
	Table, Icon, Button, Menu, Modal, Input, Form, Popconfirm, Select, DatePicker, InputNumber,
	notification, Col, Switch, Dropdown
} from 'antd';
import moment from 'moment';

import GET_TREATMENTS_QUERY from '../graphql/treatments.query.gql';

import CREATE_OBJECT_MUTATION from '../graphql/createTreatmentSeriesObject.mutation.gql';
import UPDATE_OBJECT_MUTATION from '../graphql/updateTreatmentSeriesObject.mutation.gql';
import DELETE_OBJECT_MUTATION from '../graphql/deleteTreatmentSeriesObject.mutation.gql';

import MUTATION_ADD_TREATMENT from '../graphql/TreatmentAddMutation.graphql';
import MUTATION_EDIT_TREATMENT from '../graphql/TreatmentEditMutation.graphql';
import MUTATION_DELETE_TREATMENT from '../graphql/TreatmentDeleteMutaion.graphql';

import ADD_SERIES_MUTATION from '../graphql/addTreatmentSeries.mutation.gql';
import DELETE_SERIES_MUTATION from '../graphql/deleteTreatmentSeries.mutation.gql';
import EDIT_SERIES_MUTATION from '../graphql/editTreatmentSeries.mutation.gql';

import SERIES_CREATED_SUBSCRIPTION from '../graphql/treatmentSeriesCreated.subscription.gql';
import SERIES_UPDATED_SUBSCRIPTION from '../graphql/treatmentSeriesUpdated.subscription.gql';
import SERIES_DELETED_SUBSCRIPTION from '../graphql/treatmentSeriesDeleted.subscription.gql';

import ROLES from '../../../helpers/constants/roles';
import { withCurrentUser } from '../../components/helpers/withCurrentUser';
import { TreatmentForm } from '../components/TreatmentForm';
import { TreatmentSeriesForm } from '../components/TreatmentSeriesForm';
import { TreatmentObjectsTable } from '../components/TreatmentObjectsTable';

import './Treatments.scss';
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

	// subscriptions = null;
	//
	// componentWillReceiveProps(nextProps) {
	// 	const { subscribeToMore } = this.props.data;
	// 	if (!this.subscriptions && nextProps.patient) {
	// 		console.log(subscribeToMore);
	// 		this.subscriptions = [
	// 			subscribeToMore({
	// 				document: SERIES_CREATED_SUBSCRIPTION,
	// 				variables: { patient_id: nextProps.patient.id },
	// 				updateQuery: (previousResult, { subscriptionData }) => {
	//
	// 					console.log('************************');
	//
	// 					previousResult = Object.assign({}, previousResult);
	// 					const newSeries = subscriptionData.data.treatmentSeriesCreated;
	// 					const newResult = update(previousResult, {
	// 						treatmentSeries: {
	// 							$unshift: [newSeries],
	// 						},
	// 					});
	// 					return newResult;
	// 				},
	// 			}),
	// 			subscribeToMore({
	// 				document: SERIES_UPDATED_SUBSCRIPTION,
	// 				variables: { patient_id: nextProps.patient.id },
	// 				updateQuery: (previousResult, { subscriptionData }) => {
	// 					previousResult = Object.assign({}, previousResult);
	// 					previousResult.treatmentSeries = previousResult.treatmentSeries.map((series) => {
	// 						if (series.id === subscriptionData.data.treatmentSeriesUpdated.id) {
	// 							return subscriptionData.data.treatmentSeriesUpdated;
	// 						} else {
	// 							return series;
	// 						}
	// 					});
	// 					return previousResult;
	// 				},
	// 			}),
	// 			subscribeToMore({
	// 				document: SERIES_DELETED_SUBSCRIPTION,
	// 				variables: { patient_id: nextProps.patient.id },
	// 				updateQuery: (previousResult, { subscriptionData }) => {
	// 					previousResult = Object.assign({}, previousResult);
	// 					previousResult.treatmentSeries = previousResult.treatmentSeries.filter(series => series.id !== subscriptionData.data.treatmentSeriesDeleted.id)
	// 					return previousResult;
	// 				},
	// 			})];
	// 	}
	// }

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
	};

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

	handleSubmit = (form, values) => {
		const {currentFormType, currentSeries, currentObject} = this.state;
		let mutation, params, isNew;
		
		if (currentFormType === FORM_TYPES.TreatmentSeries) {
			console.log(currentSeries);
			
			isNew = !currentSeries;
			mutation = isNew ? this.props.addSeries : this.props.editSeries;
			values.start_date = moment(values.start_date).toISOString();
			values.end_date = moment(values.end_date).toISOString();
			params = {
				patient_id: this.props.patient.id,
				clinic_id: this.props.currentClinic.id,
				...values,
			};
			
			if (currentSeries) {
				params.id = currentSeries.id;
			}
		} else {
			isNew = !currentObject;
			if (values.repeat_weeks_trigger !== undefined) {
				delete values.repeat_weeks_trigger;
			}
			mutation = isNew ? this.props.createObject : this.props.updateObject;
			params = isNew
				? {series_id: currentSeries.id, object: {[`${currentFormType}Input`]: values}}
				: {id: currentObject.id, object: {[`${currentFormType}Input`]: values}};
		}
		
		this.setState({modalLoading: true});
		
		console.log('Running form', params);
		
		mutation(params).then((res) => {
			this.hideForm();
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
	
	isExpandableRow = (row) => {
		if (!this.state.expandedRecord) {
			return true;
		}
		return row.id === this.state.expandedRecord.id;
	};
	
	expandComponent = (row) => {
		return (
			<span>...</span>
		);
	};
	
	renderPaginationPanel = (props) => {
		return (
			<div className="pagination-block">
				{ props.components.pageList }
			</div>
		);
	};
	
	onRowClick = (record, index, i, event) => {
		const isExpanded = this.state.isExpanded;
		
		if (isExpanded) {
			this.setState({ expandedRecord: null });
		} else {
			this.setState({ expandedRecord: record });
		}
		this.setState({ isExpanded: !isExpanded });
	};
	
	editRender = (cell, record) => {
		const formatMessage = this.context.intl.formatMessage;
		const { deleteSeries, patient } = this.props;
		
		return (
			<span className="treatment-actions">
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
				<span>
					<Button size="small" type='ghost' className="btn-actions btn-primary"
							onClick={ () => this.showForm(FORM_TYPES.TreatmentSeries, record) }>
						{formatMessage({ id: 'common.action_edit' })}
					</Button>
					<Popconfirm title={formatMessage({ id: 'common.confirm_message' })}
								onConfirm={ () => {
									deleteSeries(record)
										.then((res) => {
											this.props.data.refetch();
										}).catch(error => {
										console.error(error);
										let id = 'common.server_error';
										if (error.graphQLErrors) {
											id = error.graphQLErrors[0].message;
										}
										notification.error({
											message: this.context.intl.formatMessage({id}),
										});
									});
								} }
								okText={formatMessage({ id: 'common.confirm_yes' })}
								cancelText={formatMessage({ id: 'common.confirm_no' })}>
						<Button size='small' type='ghost' className="btn-actions btn-danger">
							{formatMessage({ id: 'common.action_delete' })}
						</Button>
					</Popconfirm>
				</span>
        </span>
		);
	};
	
	render() {
		const {
			data: { treatmentSeries = [], therapists = [], treatmentsList = [] },
			currentClinic, deleteSeries, currentUser, patient, deleteObject,
		} = this.props;
		const formatMessage = this.context.intl.formatMessage;
		/*const columns = [{
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
			width: '10%',
			render: (_, record) => record.objects && record.objects.filter(obj => obj.__typename === 'Treatment' && moment(obj.start_date).valueOf() < moment().valueOf()).length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.future_treatments' }),
			key: 'future_treatments',
			width: '10%',
			render: (_, record) => record.objects && record.objects.filter(obj => obj.__typename === 'Treatment' && moment(obj.start_date).valueOf() >= moment().valueOf()).length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.total_treatments' }),
			key: 'total_treatments',
			width: '10%',
			render: (_, record) => record.objects && record.objects.filter(obj => obj.__typename === 'Treatment').length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.school_observations' }),
			key: 'school_observations',
			width: '10%',
			render: (_, record) => record.objects && record.objects.filter(obj => obj.__typename === 'SchoolObservation').length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.staff_meetings' }),
			key: 'staff_meetings',
			width: '10%',
			render: (_, record) => record.objects && record.objects.filter(obj => obj.__typename === 'StaffMeeting').length,
		}, {
			title: formatMessage({ id: 'Treatments.grid_headers.outside_source_consults' }),
			key: 'outside_source_consults',
			width: '10%',
			render: (_, record) => record.objects && record.objects.filter(obj => obj.__typename === 'OutsideSourceConsult').length,
		}/!*, {
			title: formatMessage({ id: 'Treatments.field_treatments_number' }),
			key: 'treatments_number',
			dataIndex: 'treatments_number',
			sorter: (a, b) => a.treatments_number > b.treatments_number,
			width: '35%',
		}*!/, {
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
		}];*/
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
		
		const options = {
			paginationPanel: this.renderPaginationPanel,
			onRowClick: this.onRowClick,
			prePage: 'Previous', // Previous page button text
			nextPage: 'Next', // Next page button text
			alwaysShowAllBtns: true,
		};
		
		console.log(this.props);
		console.log(treatmentSeries);

		return (
			<section className="Treatments PatientObjectTab">
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
					<div className="Dashboard__Actions PatientObjectTab__Actions">
						<Button type="primary" size='small' onClick={ () => this.showForm(FORM_TYPES.TreatmentSeries) } disabled={ !currentClinic.id || patient.archived }>
							<Icon type="plus-circle-o" />
							{ formatMessage({ id: 'Treatments.create_series_button' }) }
						</Button>
					</div>
				</div>
				{/*
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
					rowKey={item => item.id + item.__typename} />
					*/}
				
				<BootstrapTable
					data={treatmentSeries}
					keyField='id'
					expandableRow={ this.isExpandableRow }
					expandComponent={record => <TreatmentObjectsTable
						treatments={record.treatments}
						updateObject={this.updateObject}
						formatMessage={formatMessage}
						deleteObject={deleteObject} />
					}
					hover consended options={options} pagination
				>
					<TableHeaderColumn width="20%" dataField="name" dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_name' })}</TableHeaderColumn>
					<TableHeaderColumn width="10%" dataField="past_treatments" dataSort caretRender={ getCaret }>{formatMessage({ id: 'Treatments.grid_headers.past_treatments' })}</TableHeaderColumn>
					<TableHeaderColumn width="10%" dataField="future_treatments" dataSort caretRender={ getCaret }>{formatMessage({ id: 'Treatments.grid_headers.future_treatments' })}</TableHeaderColumn>
					<TableHeaderColumn width="10%" dataField="total_treatments" dataSort caretRender={ getCaret }>{formatMessage({ id: 'Treatments.grid_headers.total_treatments' })}</TableHeaderColumn>
					<TableHeaderColumn width="10%" dataField="school_observations" dataSort caretRender={ getCaret }>{formatMessage({ id: 'Treatments.grid_headers.school_observations' })}</TableHeaderColumn>
					<TableHeaderColumn width="10%" dataField="staff_meetings" dataSort caretRender={ getCaret }>{formatMessage({ id: 'Treatments.grid_headers.staff_meetings' })}</TableHeaderColumn>
					<TableHeaderColumn width="10%" dataField="outside_source_consults" dataSort caretRender={ getCaret }>{formatMessage({ id: 'Treatments.grid_headers.outside_source_consults' })}</TableHeaderColumn>
					<TableHeaderColumn width="200px" dataFormat={this.editRender.bind(this)}>{formatMessage({ id: 'common.field_actions' })}</TableHeaderColumn>
				</BootstrapTable>
				
				{/*<TreatmentObjectsTable
					treatments={treatmentsList}
					updateObject={this.updateObject}
					formatMessage={formatMessage}
					deleteObject={deleteObject} />*/}
			</section>
		);
	}
}

function getCaret(direction) {
	if (direction === 'asc') {
		return (
			<span className="fa fa-sort-amount-asc"></span>
		);
	}
	if (direction === 'desc') {
		return (
			<span className="fa fa-sort-amount-desc"></span>
		);
	}
	return (
		<span className="fa fa-exchange fa-rotate-90"></span>
	);
}

const getOptions = name => ({
	props: ({ ownProps, mutate }) => ({
		[name]: (fields) => mutate({
			variables: fields,
			refetchQueries: [{
				query: GET_TREATMENTS_QUERY,
				variables: {
					clinic_id: ownProps.currentClinic.id,
					patient_id: ownProps.patient.id,
				},
			}],
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
	graphql(ADD_SERIES_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addSeries: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_TREATMENTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id,
						patient_id: ownProps.patient.id,
					},
				}],
			}),
		}),
	}),
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
	graphql(MUTATION_ADD_TREATMENT, getOptions('createObject')),
	graphql(MUTATION_EDIT_TREATMENT, getOptions('updateObject')),
	graphql(MUTATION_DELETE_TREATMENT, {
		props: ({ ownProps: { patient, currentClinic }, mutate }) => ({
			deleteObject: ({ id }) => mutate({
				variables: { id },
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
