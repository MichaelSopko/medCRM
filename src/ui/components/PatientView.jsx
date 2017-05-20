import React, { Component, PropTypes } from 'react'
import { graphql, compose, withApollo } from 'react-apollo'
import moment from 'moment';
import { connect } from 'react-redux';

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
	notification,
	message,
	Spin,
	Tabs,
	Tooltip,
	Checkbox,
} from 'antd'
const TabPane = Tabs.TabPane
import { FormattedMessage } from 'react-intl'
import nl2br from 'react-nl2br';

import TreatmentsTab from './Treatments';
import TreatmentSummaryTab from '../patient/containers/TreatmentSummaryTab';
import DiagnoseTab from '../patient/containers/DiagnoseTab';

import HEALTH_MAINTENANCES from '../../helpers/constants/health_maintenances'
import RELATED_PERSONS from '../../helpers/constants/related_persons'

import PATIENT_CREATED_SUBSCRIPTION from '../patient/graphql/PatientCreatedSubscription.graphql'
import PATIENT_UPDATED_SUBSCRIPTION from '../patient/graphql/PatientUpdatedSubscription.graphql'
import PATIENT_DELETED_SUBSCRIPTION from '../patient/graphql/PatientDeletedSubscription.graphql'

import GET_PATIENT_QUERY from '../patient/graphql/PatientGet.graphql'
import ARCHIVE_PATIENT_MUTATION from '../patient/graphql/PatientArchiveMutation.graphql'
import UNARCHIVE_PATIENT_MUTATION from '../patient/graphql/PatientUnarchiveMutation.graphql'
import EDIT_PATIENT_MUTATION from '../patient/graphql/PatientEditMutation.graphql'
import ADD_PATIENT_FILE_MUTATION from '../patient/graphql/addPatientFile.mutation.graphql'
import DELETE_PATIENT_FILE_MUTATION from '../patient/graphql/deletePatientFile.mutation.graphql'

import './PatientView.scss'

const RelatedPersonForm = Form.create()(
	({ form: { getFieldDecorator }, loading, visible, onSubmit, onCancel, formatMessage }) => {
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};

		return (
			<Modal title={ formatMessage({ id: 'Patients.add_related_persons' }) }
			       visible={visible}
			       okText={ formatMessage({ id: 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       width={340}
			       confirmLoading={loading}>
				<Form>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator(`type`, {
							validateTrigger: 'onBlur',
							rules: [{ required: true, message: formatMessage({ id: 'Patients.field_person_type_error' }) }],
						})(
							<Select placeholder={formatMessage({ id: 'Patients.field_person_type' })}>
								{ Object.keys(RELATED_PERSONS).map(key => <Select.Option value={key} key={key}>
									{formatMessage({ id: `related_persons.${RELATED_PERSONS[key]}` })}
								</Select.Option>) }
							</Select>,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator(`description`, {
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input placeholder={formatMessage({ id: 'Patients.field_person_description' })} />,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator(`phone`, {
							validateTrigger: 'onBlur',
							rules: [{ required: true, message: formatMessage({ id: 'common.field_phone_error' }) }],
						})(
							<Input type="number" placeholder={formatMessage({ id: 'common.field_phone' })} />,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator(`email`, {
							validateTrigger: 'onBlur',
							rules: [{ type: 'email', message: formatMessage({ id: 'common.field_email_error' }) }],
						})(
							<Input type="email" placeholder={formatMessage({ id: 'common.field_email' })} />,
						)}
					</Form.Item>
					<Form.Item
						hasFeedback
					>
						{getFieldDecorator(`receive_updates`, {
							validateTrigger: 'onBlur',
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
		render: (text, record) => <div className="to-dynamic-container">
			<span className="to-dynamic">
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
			<Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
				onDeleteFile(record.id)
			} } okText={formatMessage({ id: 'common.confirm_yes' })}
			            cancelText={formatMessage({ id: 'common.confirm_no' })}>
				<a>{formatMessage({ id: 'common.action_delete' })}</a>
			</Popconfirm>
		),
	},];

	return <div>
		<div style={{ margin: 16, height: 160 }}>
			<Upload.Dragger
				multiple={false}
				showUploadList={false}
				headers={uploadHeaders}
				onChange={onAddFile}
				action="/api/upload-file">
				<p className="ant-upload-drag-icon">
					<Icon type="inbox" />
				</p>
				<p className="ant-upload-text">{formatMessage({ id: 'Patients.upload_files' })}</p>
			</Upload.Dragger>
		</div>
		<Table dataSource={patient.files} columns={columns} rowKey='id' />
	</div>
};

FilesTab.contextTypes = {
	intl: PropTypes.object.isRequired,
}


const RelatedPersonsTable = ({ patient, showRelatedPersonForm, deleteRelatedPerson }, context) => {
	const formatMessage = context.intl.formatMessage;
	const columns = [{
		title: formatMessage({ id: 'Patients.field_person_type' }),
		key: 'type',
		width: '22%',
		sorter: (a, b) => a.type > b.type,
		render: (text, record) => <span>{ formatMessage({ id: `related_persons.${record.type}` }) }</span>,
	},
		{
			title: formatMessage({ id: 'common.field_phone' }),
			width: '22%',
			key: 'phone',
			render: (text, record) => <a href={`tel:${record.phone}`}>{record.phone}</a>,
		},
		{
			title: formatMessage({ id: 'common.field_email' }),
			width: '22%',
			key: 'email',
			render: (text, record) => <a href={`mailto:${record.email}`}>{record.email}</a>,
		},
		{
			title: formatMessage({ id: 'Patients.field_person_description' }),
			width: '22%',
			key: 'description',
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{record.description}</span>
			</div>,
		},
		{
			width: '12%',
			render: (text, record) => <div>
				<Button onClick={deleteRelatedPerson(record.id)} icon='delete' type='circle' />
			</div>,
		}];

	return (
		<div>
			<Table dataSource={patient.related_persons} columns={columns} pagination={false} rowKey='phone' />
			<br />
			<Button onClick={showRelatedPersonForm}
			        type='dashed'>{formatMessage({ id: 'Patients.add_related_persons' })}</Button>
		</div>
	);
};

RelatedPersonsTable.contextTypes = {
	intl: PropTypes.object.isRequired,
}


const DetailsTab = ({ patient, showRelatedPersonForm, deleteRelatedPerson }, context) => {
	const formatMessage = context.intl.formatMessage;

	let bdate = moment(patient.birth_date);
	let diff = moment.duration(moment().diff(bdate));

	return (
		<div className='Details'>

			<div className='Details__fields'>
				<div className="Details__header">
				<span className="Details__name">
					{patient.first_name} {patient.last_name}
				</span>
					<span className="Details__age" style={{ marginRight: 8 }}>
					<FormattedMessage id='Patients.age' values={{
						years: diff.years() || '0',
						months: diff.months() || '0',
						days: diff.days() || '0',
					}} />
				</span>
				</div>
				<div className="Details__id">
					#{patient.id_number}
				</div>

				<div className="Details__field">
					<div className="Details__field-name">{ formatMessage({ id: 'common.field_first_name' }) }</div>
					<div className="Details__field-value">{patient.first_name}</div>
				</div>

				<div className="Details__field">
					<div className="Details__field-name">{ formatMessage({ id: 'common.field_last_name' }) }</div>
					<div className="Details__field-value">{patient.last_name}</div>
				</div>

				<div className="Details__field">
					<div className="Details__field-name">{ formatMessage({ id: 'common.field_birth_date' }) }</div>
					<div className="Details__field-value">{moment(patient.birth_date).format('L')}</div>
				</div>

				<div className="Details__field">
					<div className="Details__field-name">{ formatMessage({ id: 'common.field_phone' }) }</div>
					<div className="Details__field-value">
						<a href={ `tel:${patient.phone}` }>{patient.phone}</a>
					</div>
				</div>

				<div className="Details__field">
					<div className="Details__field-name">{ formatMessage({ id: 'common.field_email' }) }</div>
					<div className="Details__field-value">
						<a href={ `mailto:${patient.profile_email}` }>{patient.profile_email}</a>
					</div>
				</div>

				{ !!patient.health_maintenance && <div className="Details__field">
					<div className="Details__field-name">{ formatMessage({ id: 'Patients.field_health_maintenance' }) }</div>
					<div
						className="Details__field-value">{ formatMessage({ id: `health_maintenance.${patient.health_maintenance}` }) }</div>
				</div> }
			</div>

			<div className="Details__related-persons">
				<RelatedPersonsTable showRelatedPersonForm={showRelatedPersonForm} patient={patient} deleteRelatedPerson={deleteRelatedPerson} />
			</div>

		</div>
	)
};

DetailsTab.contextTypes = {
	intl: PropTypes.object.isRequired,
}

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
	}

	state = {
		archiveLoading: false,
		formLoading: false,
		showRelatedPersonForm: false,
	}

	componentWillReceiveProps(nextProps) {

		if (!this.props.data) return;

		const { subscribeToMore } = this.props.data;

		if (!nextProps.data.loading && nextProps.data.patient && nextProps.data.patient.id && (!this.subscriptions || !this.props.data.patient || this.props.data.patient.id !== nextProps.data.patient.id)) {
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
			if (code) {
				e.graphQLErrors[0].message == 'PATIENTS_LIMIT'
				Modal.error({
					title: formatMessage({ id: 'Patients.archive_error_title' }),
					content: formatMessage({ id: 'Patients.archive_error_content' }, { limit: payload }),
				});
			} else {
				message.error(formatMessage({ id: 'common.server_error' }));
			}
			this.setState({ archiveLoading: false });
		});
	}

	onAddDiagnose = (diagnose) => {
		const { archived, __typename, ...patient } = this.props.data.patient;
		// patient.related_persons = [...patient.related_persons.map(({ __typename, ...p }) => p)]
		patient.diagnoses = [diagnose, ...patient.diagnoses];
		this.props.editPatient(patient);
	}

	onAddTreatmentSummary = (summary) => {
		const { archived, __typename, ...patient } = this.props.data.patient;
		// patient.related_persons = [...patient.related_persons.map(({ __typename, ...p }) => p)]
		patient.treatment_summary = [summary, ...patient.treatment_summary];
		this.props.editPatient(patient);
	}

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
	}

	onRelatedPersonSubmit = () => {
		const form = this.relatedPersonForm;

		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			this.setState({ formLoading: true });
			const { __typename, archived, archived_date, files, ...patient } = this.props.data.patient;
			patient.related_persons = [...patient.related_persons.map(({ __typename, ...p }) => p), values];
			this.props.editPatient(patient)
				.then(() => {
					this.setState({ formLoading: false, showRelatedPersonForm: false });
				})
				.catch((e) => {
					this.setState({ formLoading: false });
					console.error(e);
					notification.error(e);
				})
		});
	}

	showRelatedPersonForm = () => {
		this.setState({ showRelatedPersonForm: true });
	}

	hideRelatedPersonForm = () => {
		this.setState({ showRelatedPersonForm: false });
	}

	deleteRelatedPerson = idx => () => {
		const { __typename, archived, archived_date, files, ...patient } = this.props.data.patient;
		patient.related_persons = patient.related_persons.map(({ __typename, ...p }) => p).splice(idx, 1);
		this.props.editPatient(patient)
			.then(() => {
				// success
			})
			.catch((e) => {
				console.error(e);
				notification.error(e);
			})
	}

	render() {
		const { data, id, onEdit, currentUser, currentClinic } = this.props;
		const { archiveLoading, formLoading, showRelatedPersonForm } = this.state;
		const formatMessage = this.context.intl.formatMessage;

		if (!data) {
			return (
				<div className="PatientView__Empty">
					{formatMessage({ id: 'Patients.empty' })}
				</div>
			);
		}

		const { patient, loading, error } = data;

		const isReady = !loading && !error;

		if (!isReady) {
			return <div className="PatientView__Empty">
				<Spin spinning={loading} />
				{ error && <pre>{error}</pre> }
			</div>
		}

		const archivedForNow = moment(patient.archived_date).diff(moment(), 'minutes');
		const minutes = currentClinic.archive_time - archivedForNow;
		const canUnarchive = !(currentUser.role !== 'SYSTEM_ADMIN' && !currentClinic.archive_time && minutes > 0)

		return (
			<div className='PatientView'>
				<RelatedPersonForm
					loading={formLoading}
					onCancel={this.hideRelatedPersonForm}
					onSubmit={this.onRelatedPersonSubmit}
					visible={showRelatedPersonForm}
					formatMessage={formatMessage}
					ref={ form => {
						this.relatedPersonForm = form
					} }
				/>
				<Tabs
					animated={false}
					tabBarExtraContent={ <div>
						<Button icon='edit' style={{ marginLeft: 8 }}
						        onClick={onEdit(patient)}>{ formatMessage({ id: 'common.action_edit' }) }</Button>
						{ patient.archived
							? (<Tooltip
								title={ !canUnarchive && formatMessage({ id: 'Patients.archive_error_time' }, { time: minutes })}>
								<Button
									type='primary'
									style={{ backgroundColor: '#00A854' }}
									loading={archiveLoading}
									onClick={this.onUnarchiveClick}
									disabled={!canUnarchive}
									icon='unlock'>
									{ formatMessage({ id: 'common.action_unarchive' }) }
								</Button>
							</Tooltip> )
							: (
								<Popconfirm
									title={formatMessage({ id: 'common.confirm_message' })}
									onConfirm={this.props.archivePatient}
									okText={formatMessage({ id: 'common.confirm_yes' })}
									cancelText={formatMessage({ id: 'common.confirm_no' })}>
									<Button type='danger' loading={archiveLoading}
									        icon='lock'>{ formatMessage({ id: 'common.action_archive' }) }</Button>
								</Popconfirm>
							)
						}
					</div> }
					type="card">
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.details' }) }
						key="details">
						<DetailsTab patient={patient} showRelatedPersonForm={this.showRelatedPersonForm} deleteRelatedPerson={this.deleteRelatedPerson} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.diagnoses' }) }
						key="diagnoses">
						<DiagnoseTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.treatments' }) }
						key="treatments">
						<TreatmentsTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.treatment_summary' }) }
						key="treatment_summary">
						<TreatmentSummaryTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ <FormattedMessage id='Patients.tabs.files' values={{ number: patient.files.length }} /> }
						key="files">
						<FilesTab onAddFile={this.onAddFile} onDeleteFile={this.props.deleteFile} patient={patient} />
					</TabPane>
				</Tabs>
			</div>
		);
	}
}

export default PatientView;