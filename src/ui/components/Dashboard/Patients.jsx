import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import moment from 'moment'

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

import ADD_PATIENT_MUTATION from '../../graphql/PatientAddMutation.graphql'
import DELETE_PATIENT_MUTATION from '../../graphql/PatientDeleteMutaion.graphql'
import EDIT_PATIENT_MUTATION from '../../graphql/PatientEditMutation.graphql'

import PATIENT_CREATED_SUBSCRIPTION from '../../graphql/PatientCreatedSubscription.graphql'
import PATIENT_UPDATED_SUBSCRIPTION from '../../graphql/PatientUpdatedSubscription.graphql'
import PATIENT_DELETED_SUBSCRIPTION from '../../graphql/PatientDeletedSubscription.graphql'

import ROLES from '../../../helpers/constants/roles'
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import intersperse from '../../../utils/intersperse';
import PatientForm from '../PatientForm';
import PatientView from '../PatientView';
import PatientSelector from '../PatientSelector';

import './Patients.scss'


class Patients extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};

	state = {
		modalOpened: false,
		activeEntity: {},
		modalLoading: false,
		relatedPersons: [],
		currentPatientId: null,
		showArchived: false,
	};

	constructor(props) {
		super(props);

		this.subscriptions = null;
	}

	componentWillReceiveProps(nextProps) {

		return; // FIXME

		const { subscribeToMore } = this.props.data;
		// const clinicChanged = !this.props.currentClinic || (nextProps.currentClinic && (this.props.currentClinic.id !== nextProps.currentClinic.id));
		if (!nextProps.data.loading && nextProps.currentClinic && nextProps.currentClinic.id) {
			this.subscriptions = [
				subscribeToMore({
					document: PATIENT_CREATED_SUBSCRIPTION,
					variables: { clinic_id: nextProps.currentClinic.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						const newPatient = subscriptionData.data.patientCreated;
						const newResult = update(previousResult, {
							patients: {
								$unshift: [newPatient],
							},
						});
						return newResult;
					},
				}),
				subscribeToMore({
					document: PATIENT_UPDATED_SUBSCRIPTION,
					variables: { clinic_id: nextProps.currentClinic.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						previousResult.patients = previousResult.patients.map((post) => {
							if (post.id === subscriptionData.data.patientUpdated.id) {
								return subscriptionData.data.patientUpdated
							} else {
								return post
							}
						})
						return previousResult
					},
				}),
				subscribeToMore({
					document: PATIENT_DELETED_SUBSCRIPTION,
					variables: { clinic_id: nextProps.currentClinic.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						previousResult.patients = previousResult.patients.filter(patient => patient.id !== subscriptionData.data.patientDeleted.id)
						return previousResult
					},
				})];
		}
	}

	handleOk = () => {
		this.setState({ modalOpened: false });
		this.resetActiveEntity();
	};

	handleCancel = () => {
		this.setState({ modalOpened: false, relatedPersons: [] });
		this.resetActiveEntity();
	};

	showModal = () => {
		this.setState({ modalOpened: true, relatedPersons: [] });
	};

	/**
	 * Handle modal transition
	 */
	resetActiveEntity = () => {
		setTimeout(() => {
			this.setState({ activeEntity: false });
			this.form.resetFields();
		}, 300);
	};

	handleFormSubmit = () => {
		const formatMessage = this.context.intl.formatMessage;
		const form = this.form;
		const isEditing = !!Object.keys(this.state.activeEntity).length;
		const processFiles = files => files.map(file => {
			file = file.response ? file.response.files[0] : file; // Handle new uploaded files
			const { name, url, size, type } = file;
			return {
				name,
				url,
				size,
				type,
			}
		});
		const processRelatedPersons = (relatedPersons, values) => {
			values.related_persons = [];
			relatedPersons.forEach(({ _id }) => {
				const type = values[`related_persons-${_id}-type`];
				delete values[`related_persons-${_id}-type`];
				const phone = values[`related_persons-${_id}-phone`];
				delete values[`related_persons-${_id}-phone`];
				const email = values[`related_persons-${_id}-email`];
				delete values[`related_persons-${_id}-email`];
				const description = values[`related_persons-${_id}-description`];
				delete values[`related_persons-${_id}-description`];
				values.related_persons.push({ type, phone, email, description });
			})
			return values;
		};
		const errorHandler = e => {
			this.setState({ modalLoading: false });
			console.error(e);
			let id = 'common.server_error';
			if (e.graphQLErrors) {
				const message = e.graphQLErrors[0].message;
				if (message === 'DUPLICATE_EMAIL') id = 'common.field_email_error_duplicate';
				if (message === 'DUPLICATE_ID_NUMBER') id = 'common.field_id_number_error_duplicate';
			}
			notification.error({
				message: formatMessage({ id }),
			});
		};

		form.validateFields((err, { files, ...values }) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			console.log(values);
			files = files ? processFiles(files) : [];
			values = processRelatedPersons(this.state.relatedPersons, values);

			values.birth_date = moment(values.birth_date);

			isEditing

				? this.props.editPatient({
				id: this.state.activeEntity.id,
				patient: {
					...values,
					files,
				},
			}).then(() => {
				form.resetFields();
				this.setState({ modalOpened: false, modalLoading: false, relatedPersons: [] });
				this.resetActiveEntity();
			}).catch(errorHandler)

				: this.props.addPatient({
				clinic_id: this.props.currentClinic.id,
				patient: {
					...values,
					files,
				},
			}).then((res) => {
				form.resetFields();
				this.setState({
					modalOpened: false,
					modalLoading: false,
					relatedPersons: [],
					currentPatientId: res.data.addPatient.id,
				});
				message.success(this.context.intl.formatMessage({ id: 'Patients.created-message' }));
			}).catch(errorHandler);

		});
	};

	editEntity = entity => () => {
		this.form.resetFields();
		let relatedPersons = entity.related_persons || [];
		relatedPersons = relatedPersons.map(person => ({ ...person, _id: Math.random().toString(36).substring(7) }));
		this.setState({
			modalOpened: true,
			activeEntity: entity,
			relatedPersons,
		});
	};

	onUploadFileChange = info => {

	};

	addRelatedPerson = () => {
		let relatedPersons = [...this.state.relatedPersons, { _id: Math.random().toString(36).substring(7) }];
		this.setState({ relatedPersons });
	};

	removeRelatedPerson = (id) => {
		let { relatedPersons } = this.state;
		relatedPersons = relatedPersons.filter(person => person._id !== id);
		this.setState({ relatedPersons });
	};

	onPatientChange = (id) => {
		this.setState({ currentPatientId: id })
	}

	onShowArchivedChange = (e) => {
		this.setState({ showArchived: e.target.checked })
	}

	render() {
		const { deletePatient, currentClinic } = this.props;
		const formatMessage = this.context.intl.formatMessage;
		const { modalOpened, activeEntity, modalLoading, relatedPersons, currentPatientId, showArchived } = this.state;

		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			width: '20%',
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{record.first_name} {record.last_name}</span>
			</div>,
		}, {
			title: formatMessage({ id: 'common.field_phone' }),
			dataIndex: 'phone',
			key: 'phone',
			width: '15%',
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic"><a href={ `tel:${text}` }>{ text }</a></span>
			</div>,
		}, {
			title: formatMessage({ id: 'common.field_email' }),
			dataIndex: 'profile_email',
			key: 'profile_email',
			width: '15%',
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic"><a href={ `mailto:${text}` }>{ text }</a></span>
			</div>,
		}, {
			title: formatMessage({ id: 'Patients.field_files' }),
			dataIndex: 'files',
			key: 'files',
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">
					{ intersperse(record.files.map(file => <a href={file.url}>{file.name}</a>), ", ") }
					</span>
			</div>,
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '20%',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider" />
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deletePatient(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })}
		                  cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size="small" type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
		        </Button>
		      </Popconfirm>
        </span>
			),
		}];


		return (
			<div className="Container">
				<section className="Patients">
					<PatientForm
						ref={ form => {
							this.form = form
						} }
						visible={modalOpened}
						loading={modalLoading}
						onCancel={this.handleCancel}
						onSubmit={this.handleFormSubmit}
						formatMessage={formatMessage}
						onUploadFileChange={this.onUploadFileChange}
						values={activeEntity}
						relatedPersons={relatedPersons}
						addRelatedPerson={this.addRelatedPerson}
						removeRelatedPerson={this.removeRelatedPerson}
					/>
					<div>
						{/*						<h1 className="Dashboard__Header">
						 { formatMessage({ id: 'Patients.header' }) }
						 </h1>*/}
						<div className="Dashboard__Actions">
							<div>
								<PatientSelector showArchived={showArchived} onChange={this.onPatientChange} />
								<Checkbox checked={showArchived} onChange={this.onShowArchivedChange}>Show archived</Checkbox>
							</div>
							<div>
								<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
									<ClinicsSelector />
								</CheckAccess>
								<Button size='large' type="primary" onClick={ this.showModal } disabled={ !currentClinic.id }>
									<Icon type="plus-circle-o" />
									{ formatMessage({ id: 'Patients.create_button' }) }
								</Button>
							</div>
						</div>
					</div>

					<div style={{ marginTop: 24 }}>
						<PatientView patientId={currentPatientId} onEdit={this.editEntity} />
					</div>
					{/*<Table dataSource={patients} columns={columns} loading={loading} rowKey='id'/>*/}
				</section>
			</div>
		);
	}
}

const PatientsWithApollo = withApollo(compose(
	connect((state) => ({ currentClinic: state.currentClinic })),
	graphql(ADD_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addPatient: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: PATIENTS_LIST_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id,
					},
				}],
			}),
		}),
	}),
	graphql(DELETE_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deletePatient: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: PATIENTS_LIST_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id,
					},
				}],
			}),
		}),
	}),
	graphql(EDIT_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editPatient: (fields) => mutate({
				variables: fields,
				refetchQueries: [/*{
				 query: GET_PATIENTS_QUERY,
				 variables: {
				 clinic_id: ownProps.currentClinic.id
				 }
				 }*/],
			}),
		}),
	}),
)(Patients));


export default PatientsWithApollo;