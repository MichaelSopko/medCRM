import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage } from 'react-intl';

import {
	Table,
	Icon,
	Button,
	Modal,
	Input,
	Form,
	Popconfirm,
	Select,
	Upload,
	notification,
	message,
	Spin,
	Tabs,
	Tooltip,
	Checkbox,
} from 'antd';

import TreatmentsTab from '../treatment_series/containers/Treatments';
import TreatmentSummaryTab from '../patient/containers/TreatmentSummaryTab';
import DiagnoseTab from '../patient/containers/DiagnoseTab';

import RELATED_PERSONS from '../../helpers/constants/related_persons';
import PATIENT_UPDATED_SUBSCRIPTION from '../patient/graphql/PatientUpdatedSubscription.graphql';

import GET_PATIENT_QUERY from '../patient/graphql/PatientGet.graphql';
import ARCHIVE_PATIENT_MUTATION from '../patient/graphql/PatientArchiveMutation.graphql';
import UNARCHIVE_PATIENT_MUTATION from '../patient/graphql/PatientUnarchiveMutation.graphql';
import EDIT_PATIENT_MUTATION from '../patient/graphql/PatientEditMutation.graphql';
import ADD_PATIENT_FILE_MUTATION from '../patient/graphql/addPatientFile.mutation.graphql';
import DELETE_PATIENT_FILE_MUTATION from '../patient/graphql/deletePatientFile.mutation.graphql';

import './PatientView.scss';

const TabPane = Tabs.TabPane;

const RelatedPersonForm = Form.create()(
	({ form: { getFieldDecorator, isFieldsTouched },
		 loading, visible, onSubmit, onCancel, formatMessage, values }) => {
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!values;
		values = values || {};

		const checkForConfirm = () => isFieldsTouched() ? Modal.confirm({
			title: formatMessage({ id: 'common.modal_save_confirm.title' }),
			onOk: onCancel,
			okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' }),
		}) : onCancel();

		return (
			<Modal
				title={formatMessage({ id: 'Patients.add_related_persons' })}
				visible={visible}
				okText={formatMessage({ id: 'common.action_create' })}
				onCancel={checkForConfirm}
				onOk={onSubmit}
				width={340}
				confirmLoading={loading}
			>
				<Form>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator('type', {
							validateTrigger: 'onBlur',
							initialValue: values.type,
							rules: [{
								required: true,
								message: formatMessage({ id: 'Patients.field_person_type_error' }),
							}],
						})(
							<Select placeholder={formatMessage({ id: 'Patients.field_person_type' })}>
								{Object.keys(RELATED_PERSONS).map(key => <Select.Option value={key} key={key}>
									{formatMessage({ id: `related_persons.${RELATED_PERSONS[key]}` })}
								</Select.Option>)}
							</Select>,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator('name', {
							initialValue: values.name,
							validateTrigger: 'onBlur',
							rules: [{
								required: true,
								message: formatMessage({ id: 'Patients.field_person_name_error' }),
							}],

						})(
							<Input placeholder={formatMessage({ id: 'Patients.field_person_name' })} />,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator('description', {
							initialValue: values.description,
							validateTrigger: 'onBlur',
							rules: [],
						})(
							<Input placeholder={formatMessage({ id: 'Patients.field_person_description' })} />,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator('email', {
							validateTrigger: 'onBlur',
							initialValue: values.email,
							rules: [{ type: 'email', message: formatMessage({ id: 'common.field_email_error' }) }],
						})(
							<Input type="email" placeholder={formatMessage({ id: 'common.field_email' })} />,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator('phone', {
							validateTrigger: 'onBlur',
							initialValue: values.phone,
							rules: [{ message: formatMessage({ id: 'common.field_phone_error' }) }],
						})(
							<Input type="number" placeholder={formatMessage({ id: 'common.field_phone' })} />,
						)}
					</Form.Item>
					<Form.Item>
						{getFieldDecorator('receive_updates', {
							validateTrigger: 'onBlur',
							initialValue: values.receive_updates,
							valuePropName: 'checked',
							rules: [],
						})(
							<Checkbox>
								{formatMessage({ id: 'Patients.field_receive_updates' })}
							</Checkbox>,
						)}
					</Form.Item>
				</Form>
			</Modal>
		);
	},
);

const FilesTab = ({ patient, onAddFile, onDeleteFile }, context) => {
	const formatMessage = context.intl.formatMessage;
	const token = localStorage.getItem('token');
	const uploadHeaders = {
		Authorization: `Bearer ${token}`,
	};
	const columns = [{
		title: formatMessage({ id: 'common.field_name' }),
		key: 'name',
		width: '70%',
		sorter: (a, b) => a.name > b.name,
		render: (text, record) => <div className='to-dynamic-container'>
			<span className='to-dynamic'>
				<a href={record.url}>{record.name}</a>
			</span>
		</div>,
	}, {
		title: formatMessage({ id: 'common.size' }),
		dataIndex: 'size',
		key: 'size',
		width: '15%',
		sorter: (a, b) => a.size > b.size,
		render: text => <div>
			{text}
		</div>,
	}, {
		title: formatMessage({ id: 'common.field_actions' }),
		key: 'action',
		width: '15%',
		render: (text, record) => (
			<Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={() => {
				onDeleteFile(record.id)
			}} okText={formatMessage({ id: 'common.confirm_yes' })}
			            cancelText={formatMessage({ id: 'common.confirm_no' })}>
				<a>{formatMessage({ id: 'common.action_delete' })}</a>
			</Popconfirm>
		),
	},];
	
	const nameRender = (text, record) => {
		return (
			<span>
				<a href={record.url}>{record.name}</a>
			</span>
		);
	};
	
	function formatBytes(bytes,decimals) {
		if(bytes == 0) return '0 Bytes';
		var k = 1024,
			dm = decimals || 2,
			sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
			i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}
	
	const sizeRender = (text, record) => {
		return (
			<span>
				{formatBytes(record.size)}
			</span>
		);
	};
	
	const editRender = (cell, record) => {
		const onDelete = () => {
			onDeleteFile(record.id)
		};
		
		const checkForConfirm = () => Modal.confirm({
			title: formatMessage({id: 'common.confirm_message'}),
			okText: formatMessage({id: 'common.confirm_yes'}),
			cancelText: formatMessage({id: 'common.confirm_no'}),
			onOk: onDelete.bind(this),
		});
		
		return (
			<span>
				<Button size="small" className="btn-actions btn-danger" onClick={checkForConfirm}
						type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
			</span>
		);
	};
	
	const renderPaginationPanel = (props) => {
		return (
			<div className="pagination-block">
				{ props.components.pageList }
			</div>
		);
	};
	
	const getCaret = (direction) => {
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
	};
	
	const options = {
		paginationPanel: renderPaginationPanel,
		prePage: 'Previous', // Previous page button text
		nextPage: 'Next', // Next page button text
		alwaysShowAllBtns: true,
		noDataText: formatMessage({id: 'common.no_data'}),
	};

	return <div>
		<div style={{ margin: 16, height: 160 }} className="PatientObjectTab">
			<Upload.Dragger
				multiple={false}
				showUploadList={false}
				headers={uploadHeaders}
				onChange={onAddFile}
				action='/api/upload-file'>
				<p className='ant-upload-drag-icon'>
					<Icon type='inbox'/>
				</p>
				<p className='ant-upload-text'>{formatMessage({ id: 'Patients.upload_files' })}</p>
			</Upload.Dragger>
		</div>
		<BootstrapTable data={patient.files} keyField='id' hover consended options={options} pagination>
			<TableHeaderColumn dataField='name' dataFormat={nameRender} dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_name' })}</TableHeaderColumn>
			<TableHeaderColumn width="15%" dataFormat={sizeRender} dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.size' })}</TableHeaderColumn>
			<TableHeaderColumn width="100px" dataFormat={editRender}>{formatMessage({ id: 'common.field_actions' })}</TableHeaderColumn>
		</BootstrapTable>
	</div>
};

FilesTab.contextTypes = {
	intl: PropTypes.object.isRequired,
};


const RelatedPersonsTable = (
	{ patient, showRelatedPersonForm, deleteRelatedPerson, editRelatedPerson }, context) => {
	const formatMessage = context.intl.formatMessage;
	
	const editRender = (cell, record) => {
		const onDelete = () => {
			deleteRelatedPerson(record._id);
		};
		
		const checkForConfirm = () => Modal.confirm({
			title: formatMessage({id: 'common.confirm_message'}),
			okText: formatMessage({id: 'common.confirm_yes'}),
			cancelText: formatMessage({id: 'common.confirm_no'}),
			onOk: onDelete.bind(this),
		});
		
		return (
			<span>
				<Button size="small" className="btn-actions btn-danger" onClick={checkForConfirm}
						type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
			</span>
		);
	};
	
	const typeRender = (cell, record) => {
		return (
			<span>
				{formatMessage({ id: `related_persons.${record.type}` })}
			</span>
		);
	};

	const onRowClick = (record, index, i, event) => {
		// dont edit when button clicked
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.parentNode.tagName === 'BUTTON') {
			return;
		}
		editRelatedPerson(record);
	};

	const getCaret = (direction) => {
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
	};

	const options = {
		onRowClick,
		noDataText: formatMessage({id: 'common.no_data'}),
	};

	return (
		<div className="patient-relateds">
			<BootstrapTable
				data={patient.related_persons.map((p, _id) => ({ ...p, _id }))}
				keyField="_id" hover consended options={options}
			>
				<TableHeaderColumn width="10%" dataFormat={typeRender} dataField="type" dataSort caretRender={getCaret}>
					{formatMessage({ id: 'Patients.field_person_type' })}
				</TableHeaderColumn>
				<TableHeaderColumn width="20%" dataField="name" dataSort caretRender={getCaret}>
					{formatMessage({ id: 'common.field_name' })}
				</TableHeaderColumn>
				<TableHeaderColumn width="13%" dataField="phone" dataSort caretRender={getCaret}>
					{formatMessage({ id: 'common.field_phone' })}
				</TableHeaderColumn>
				<TableHeaderColumn width="20%" dataField="email" dataSort caretRender={getCaret}>
					{formatMessage({ id: 'common.field_email' })}
				</TableHeaderColumn>
				<TableHeaderColumn dataField="description" dataSort caretRender={getCaret}>
					{formatMessage({ id: 'Patients.field_person_description' })}
				</TableHeaderColumn>
				<TableHeaderColumn width="100px" dataFormat={editRender}>
					{formatMessage({ id: 'common.field_actions' })}
				</TableHeaderColumn>
			</BootstrapTable>
			<br />
			<Button
				onClick={showRelatedPersonForm}
				type="dashed"
			>
				{formatMessage({ id: 'Patients.add_related_persons' })}
			</Button>
		</div>
	);
};

RelatedPersonsTable.contextTypes = {
	intl: PropTypes.object.isRequired,
};

const DetailsTab = (
	{ patient, showRelatedPersonForm, deleteRelatedPerson, editRelatedPerson, treatmentsCounts },
	context) => {
	const formatMessage = context.intl.formatMessage;
	const bdate = moment(patient.birth_date);
	const diff = moment.duration(moment().diff(bdate));

	return (
		<div>
			<div className="detail-tab-wrap">
				<div className="Details">
					<div className="Details__fields">
						<div className="Details__header">
							<span className="Details__name">
								{patient.first_name} {patient.last_name}
							</span>
							<span className="Details__age">
								<FormattedMessage
									id="Patients.age"
									values={{
										years: diff.years() || '0',
										months: diff.months() || '0',
										days: diff.days() || '0',
									}}
								/>
							</span>
						</div>
						<div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'common.field_id_number' })}</div>
							<div className="Details__field-value">{patient.id_number}</div>
						</div>
						
						<div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'common.field_first_name' })}</div>
							<div className="Details__field-value">{patient.first_name}</div>
						</div>
						
						<div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'common.field_last_name' })}</div>
							<div className="Details__field-value">{patient.last_name}</div>
						</div>
						
						<div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'common.field_birth_date' })}</div>
							<div className="Details__field-value">{moment(patient.birth_date).format('L')}</div>
						</div>
						
						<div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'common.field_phone' })}</div>
							<div className="Details__field-value">
								<a href={`tel:${patient.phone}`}>{patient.phone}</a>
							</div>
						</div>
						{!!patient.health_maintenance && <div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'Patients.field_health_maintenance' })}</div>
							<div className="Details__field-value">{formatMessage({ id: `health_maintenance.${patient.health_maintenance}` })}</div>
						</div>}
						<div className="Details__field">
							<div className="Details__field-name">{formatMessage({ id: 'common.field_remarks' })}</div>
							<div className="Details__field-value">
								{patient.remarks}
							</div>
						</div>
					</div>
				</div>
				<div className="Details__related-persons">
					<RelatedPersonsTable
						showRelatedPersonForm={showRelatedPersonForm}
						editRelatedPerson={editRelatedPerson}
						patient={patient}
						deleteRelatedPerson={deleteRelatedPerson}
					/>
				</div>
			</div>
			 <BootstrapTable data={treatmentsCounts} keyField='id' hover consended >
				<TableHeaderColumn dataField="past_treatments">{formatMessage({ id: 'Treatments.grid_headers.past_treatments' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="future_treatments">{formatMessage({ id: 'Treatments.grid_headers.future_treatments' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="total_treatments">{formatMessage({ id: 'Treatments.grid_headers.total_treatments' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="school_observations">{formatMessage({ id: 'Treatments.grid_headers.school_observations' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="staff_meetings">{formatMessage({ id: 'Treatments.grid_headers.staff_meetings' })}</TableHeaderColumn>
				<TableHeaderColumn dataField="outside_source_consults">{formatMessage({ id: 'Treatments.grid_headers.outside_source_consults' })}</TableHeaderColumn>
			</BootstrapTable>
		</div>
	);
};

DetailsTab.contextTypes = {
	intl: PropTypes.object.isRequired,
};

@compose(
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(GET_PATIENT_QUERY, {
		options: ({ patientId }) => ({
			variables: { id: patientId },
		}),
		skip: ({ patientId }) => !patientId,
	}),
	graphql(ARCHIVE_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			archivePatient: () => mutate({
				variables: { id: ownProps.patientId },
			}),
		}),
	}),
	graphql(UNARCHIVE_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			unarchivePatient: () => mutate({
				variables: { id: ownProps.patientId },
			}),
		}),
	}),
	graphql(EDIT_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editPatient: ({ id, ...patient }) => mutate({
				variables: { id, patient },
				refetchQueries: [],
			}),
		}),
	}),
	graphql(ADD_PATIENT_FILE_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addFile: (file) => mutate({
				variables: { file: { patient_id: ownProps.patientId, ...file } },
				refetchQueries: [],
			}),
		}),
	}),
	graphql(DELETE_PATIENT_FILE_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteFile: (id) => mutate({
				variables: { id },
				refetchQueries: [],
			}),
		}),
	}),
)
class PatientView extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	state = {
		archiveLoading: false,
		formLoading: false,
		showRelatedPersonForm: false,
		activeRelatedPerson: null,
        activeKey: 'details',
	};

	componentWillReceiveProps(nextProps) {

		if (!this.props.data) return;

		const { subscribeToMore } = this.props.data;

		if (!nextProps.data.loading && nextProps.data.patient && nextProps.data.patient.id
			&& (!this.subscriptions || !this.props.data.patient
			|| this.props.data.patient.id !== nextProps.data.patient.id)
		) {
			this.subscriptions = [
				subscribeToMore({
					document: PATIENT_UPDATED_SUBSCRIPTION,
					variables: { id: nextProps.data.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						console.log(subscriptionData);
						return subscriptionData.data
					},
				}),];
		}
	}

	onUnarchiveClick = () => {
		const formatMessage = this.context.intl.formatMessage;
		this.setState({ archiveLoading: true });
		this.props.unarchivePatient().then(() => {
			message.info(formatMessage({ id: 'Patients.unarchived_message' }));
			this.setState({ archiveLoading: false });
		}).catch(e => {
			const { code, payload } = JSON.parse(e.graphQLErrors[0].message);
			if (code === 'PATIENTS_LIMIT') {
				e.graphQLErrors[0].message == 'PATIENTS_LIMIT'
				Modal.error({
					title: formatMessage({ id: 'Patients.archive_error_title' }),
					content: formatMessage({ id: 'Patients.archive_error_content' }, { limit: payload }),
				});
			} else if (code === 'TIME_LIMIT') {
				Modal.error({
					title: formatMessage({ id: 'Patients.archive_error_title' }),
					content: formatMessage({ id: 'Patients.archive_error_time' }, { time: payload }),
				});
			} else {
				message.error(formatMessage({ id: 'common.server_error' }));
			}
			this.setState({ archiveLoading: false });
		});
	};

	onAddDiagnose = (diagnose) => {
		const { archived, __typename, ...patient } = this.props.data.patient;
		// patient.related_persons = [...patient.related_persons.map(({ __typename, ...p }) => p)]
		patient.diagnoses = [diagnose, ...patient.diagnoses];
		this.props.editPatient(patient);
	};

	onAddTreatmentSummary = (summary) => {
		const { archived, __typename, ...patient } = this.props.data.patient;
		// patient.related_persons = [...patient.related_persons.map(({ __typename, ...p }) => p)]
		patient.treatment_summary = [summary, ...patient.treatment_summary];
		this.props.editPatient(patient);
	};

	onAddFile = (info) => {
		const status = info.file.status;
		if (status !== 'uploading') {
			// console.log(info.file, info.fileList);
		}
		if (status === 'done') {
			const { name, url, type, size } = info.file.response.files[0];
			this.props.addFile({ name, url, type, size }).then(() => {
				// message.success(`${info.file.name} file uploaded successfully.`);
			});
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
		}
	};

	onRelatedPersonSubmit = () => {
		const form = this.relatedPersonForm;

		form.validateFields((err, values) => {
			const { activeRelatedPerson } = this.state;
			const isEditing = !!activeRelatedPerson;

			if (err) {
				return;
			}
			
			this.setState({ formLoading: true });
			const {
				__typename, archived, archived_date, files, objects, clinic_id, ...patient
			} = this.props.data.patient;
			
			patient.related_persons = !isEditing
				? [...patient.related_persons.map(({ __typename, ...p }) => p), values]
				: patient.related_persons.map(({ __typename, ...p }, idx) => {
					return idx === activeRelatedPerson._id ? values : p;
				});
			
			this.props.editPatient(patient)
				.then(() => {
					this.setState({
						formLoading: false,
						showRelatedPersonForm: false,
						activeRelatedPerson: null,
					}, () => {
						form.resetFields();
					});
				})
				.catch((e) => {
					this.setState({ formLoading: false });
					console.error(e);
					notification.error({ message: e.message });
				});
		});
	};

	showRelatedPersonForm = () => {
		this.setState({ showRelatedPersonForm: true });
	};

	editRelatedPerson = (activeRelatedPerson) => {
		this.setState({ showRelatedPersonForm: true, activeRelatedPerson });
	};

	hideRelatedPersonForm = () => {
		this.setState({ showRelatedPersonForm: false, activeRelatedPerson: null });
	};

	deleteRelatedPerson = idx => {
		const {
			__typename, archived, archived_date, files, clinic_id, ...patient
		} = this.props.data.patient;
		
		patient.related_persons = patient.related_persons.map(({ __typename, ...p }) => p);
		patient.related_persons.splice(idx, 1);
		
		this.props.editPatient(patient)
			.then(() => {
				// success
			})
			.catch((e) => {
				console.error(e);
				notification.error(e);
			});
	};

	render() {
		const { data, id, onEdit, currentUser, currentClinic, activeTabKey, onChangeTabKey } = this.props;
		const { archiveLoading, formLoading, showRelatedPersonForm, activeRelatedPerson } = this.state;
		const formatMessage = this.context.intl.formatMessage;
		
		if (!data) {
			return (
				<div className="PatientView__Empty">
					{formatMessage({ id: 'Patients.empty' })}
				</div>
			);
		}

		const { patient, loading, past_treatments, future_treatments, total_treatments,
			school_observations, staff_meetings, outside_source_consults, error } = data;
		const isReady = !loading && !error;

		if (!isReady) {
			return (
				<div className="PatientView__Empty">
					<Spin spinning={loading} />
					{error && <pre>{error}</pre>}
				</div>
			);
		}

		const archivedForNow = moment(patient.archived_date).diff(moment(), 'minutes');
		const minutes = currentClinic.archive_time - (-archivedForNow);
		const canUnarchive = currentUser.role === 'SYSTEM_ADMIN' || (!currentClinic.archive_time || minutes <= 0);
			
		const checkForConfirm = () => Modal.confirm({
			title: formatMessage({id: 'common.confirm_message'}),
			okText: formatMessage({id: 'common.confirm_yes'}),
			cancelText: formatMessage({id: 'common.confirm_no'}),
			onOk: this.props.archivePatient,
		});
		
		const treatmentsCounts = [{
			past_treatments,
			future_treatments,
			total_treatments,
			school_observations,
			staff_meetings,
			outside_source_consults,
		}];
		
		return (
			<div className='PatientView'>
				<RelatedPersonForm
					loading={formLoading}
					onCancel={this.hideRelatedPersonForm}
					onSubmit={this.onRelatedPersonSubmit}
					visible={showRelatedPersonForm}
					formatMessage={formatMessage}
					values={activeRelatedPerson}
					ref={form => { this.relatedPersonForm = form }}
				/>
				<Tabs
					animated={false}
					activeKey={activeTabKey}
					onChange={onChangeTabKey}
					tabBarExtraContent={<div className="top-bar-extra">
						<Button
							icon="edit"
							className="btn-actions btn-primary"
							onClick={onEdit(patient)}
						>{formatMessage({ id: 'common.action_edit' })}</Button>
						{patient.archived
							? (
								<Tooltip
									title={!canUnarchive && formatMessage({ id: 'Patients.archive_error_time' }, { time: minutes })}>
									<Button
										type="primary"
										style={{ backgroundColor: '#00A854', borderColor: '#00A854' }}
										loading={archiveLoading}
										onClick={this.onUnarchiveClick}
										disabled={!canUnarchive}
										icon="unlock"
									>
										{formatMessage({ id: 'common.action_unarchive' })}
									</Button>
								</Tooltip>
							)
							: (
								<span>
									<Button
										type="danger"
										loading={archiveLoading}
										onClick={checkForConfirm}
										icon="lock"
										className="btn-actions btn-danger"
									>
										{formatMessage({ id: 'common.action_archive' })}
									</Button>
								</span>
							)
						}
					</div>}
					type="card"
				>
					<TabPane
						className="PatientView__Tab"
						tab={formatMessage({ id: 'Patients.tabs.details' })}
						key="details">
						<DetailsTab
							patient={patient}
							treatmentsCounts={treatmentsCounts}
							showRelatedPersonForm={this.showRelatedPersonForm}
							editRelatedPerson={this.editRelatedPerson}
							deleteRelatedPerson={this.deleteRelatedPerson}/>
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={formatMessage({ id: 'Patients.tabs.diagnoses' })}
						key='diagnoses'>
						<DiagnoseTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={formatMessage({ id: 'Patients.tabs.treatments' })}
						key='treatments'>
						<TreatmentsTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={formatMessage({ id: 'Patients.tabs.treatment_summary' })}
						key='treatment_summary'>
						<TreatmentSummaryTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={<FormattedMessage id='Patients.tabs.files' values={{ number: `(${patient.files.length})` }}/>}
						key='files'>
						<FilesTab onAddFile={this.onAddFile} onDeleteFile={this.props.deleteFile} patient={patient}/>
					</TabPane>
				</Tabs>
			</div>
		);
	}
}

export default PatientView;
