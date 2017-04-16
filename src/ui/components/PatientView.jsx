import React, { Component, PropTypes } from 'react'
import { graphql, compose, withApollo } from 'react-apollo'
import moment from 'moment';

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
} from 'antd'
const TabPane = Tabs.TabPane
import { FormattedMessage } from 'react-intl'
import nl2br from 'react-nl2br';

import TreatmentsTab from './Treatments';

import HEALTH_MAINTENANCES from '../../helpers/constants/health_maintenances'
import RELATED_PERSONS from '../../helpers/constants/related_persons'

import PATIENT_CREATED_SUBSCRIPTION from '../graphql/PatientCreatedSubscription.graphql'
import PATIENT_UPDATED_SUBSCRIPTION from '../graphql/PatientUpdatedSubscription.graphql'
import PATIENT_DELETED_SUBSCRIPTION from '../graphql/PatientDeletedSubscription.graphql'

import GET_PATIENT_QUERY from '../graphql/PatientGet.graphql'
import ARCHIVE_PATIENT_MUTATION from '../graphql/PatientArchiveMutation.graphql'
import UNARCHIVE_PATIENT_MUTATION from '../graphql/PatientUnarchiveMutation.graphql'
import EDIT_PATIENT_MUTATION from '../graphql/PatientEditMutation.graphql'

import './PatientView.scss'


const StringsForm = Form.create()(
	({ name, onAdd, form }) => (
		<Form onSubmit={(e) => {
			e.preventDefault();
			form.validateFieldsAndScroll((err, values) => {
				if (!err) {
					onAdd(values.new);
				}
			});
		}}>
			<Form.Item
				hasFeedback
			>
				{form.getFieldDecorator('new', {
					rules: [{
						type: 'string',
					}, {
						required: true,
					}],
				})(
					<Input type='textarea' rows={4} />,
				)}
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit"
				        size="large"><FormattedMessage id='common.action_create' /></Button>
			</Form.Item>
		</Form>
	),
);

StringsForm.contextTypes = {
	intl: PropTypes.object.isRequired,
}

const StringsTab = ({ name, strings, onAdd }) => {
	return (
		<div>
			<StringsForm name={name} onAdd={onAdd} />
			{ strings.map(item => <div style={{ lineHeight: 1.5, padding: 24 }}>
				{nl2br(item)}
			</div>) }
		</div>
	)
};

const FilesTab = ({ patient }, context) => {
	const formatMessage = context.intl.formatMessage;
	const columns = [{
		title: formatMessage({ id: 'common.field_name' }),
		key: 'name',
		width: '85%',
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
		render: text => <div>
			{text}
		</div>,
	}];

	return <Table dataSource={patient.files} columns={columns} rowKey='id' />
};

FilesTab.contextTypes = {
	intl: PropTypes.object.isRequired,
}


const RelatedPersonsTable = ({ patient }, context) => {
	const formatMessage = context.intl.formatMessage;
	const columns = [{
		title: formatMessage({ id: 'Patients.field_person_type' }),
		key: 'type',
		width: '20%',
		render: (text, record) => <span>{ formatMessage({ id: `related_persons.${record.type}` }) }</span>,
	},
		{
			title: formatMessage({ id: 'common.field_phone' }),
			width: '20%',
			key: 'phone',
			render: (text, record) => <a href={`tel:${record.phone}`}>{record.phone}</a>,
		},
		{
			title: formatMessage({ id: 'common.field_email' }),
			width: '20%',
			key: 'email',
			render: (text, record) => <a href={`mailto:${record.email}`}>{record.email}</a>,
		},
		{
			title: formatMessage({ id: 'Patients.field_person_description' }),
			width: '30%',
			key: 'description',
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{record.description}</span>
			</div>,
		}];

	return <Table dataSource={patient.related_persons} columns={columns} pagination={false} rowKey='phone' />
};

RelatedPersonsTable.contextTypes = {
	intl: PropTypes.object.isRequired,
}


const DetailsTab = ({ patient }, context) => {
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
					<span className="Details__age">
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
				<RelatedPersonsTable patient={patient} />
			</div>

		</div>
	)
};

DetailsTab.contextTypes = {
	intl: PropTypes.object.isRequired,
}

@compose(
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
)
class PatientView extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	}

	state = {
		archiveLoading: false,
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
		patient.related_persons = [ ...patient.related_persons.map(({ __typename, ...p }) => p) ]
		patient.diagnoses = [ summary, ...patient.diagnoses ];
		this.props.editPatient(patient);
	}

	onAddTreatmentSummary = (summary) => {
		const { archived, __typename, ...patient } = this.props.data.patient;
		patient.related_persons = [ ...patient.related_persons.map(({ __typename, ...p }) => p) ]
		patient.treatment_summary = [ summary, ...patient.treatment_summary ];
		this.props.editPatient(patient);
	}

	render() {
		const { data, id, onEdit } = this.props;
		const { archiveLoading } = this.state;
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

		return (
			<div className='PatientView'>
				<Tabs
					tabBarExtraContent={ <div>
						{ patient.archived
							? <Button type='primary' style={{ backgroundColor: '#00A854' }} loading={archiveLoading} onClick={this.onUnarchiveClick}
							          icon='unlock'>{ formatMessage({ id: 'common.action_unarchive' }) }</Button>
							: <Button type='danger' loading={archiveLoading} onClick={this.props.archivePatient}
							          icon='lock'>{ formatMessage({ id: 'common.action_archive' }) }</Button>
						}
						<Button icon='edit' style={{ marginLeft: 8 }}
						        onClick={onEdit(patient)}>{ formatMessage({ id: 'common.action_edit' }) }</Button>
					</div> }
					type="card">
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.details' }) }
						key="details">
						<DetailsTab patient={patient} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.diagnoses' }) }
						key="diagnoses">
						<StringsTab name='' strings={patient.diagnoses} onAdd={this.onAddDiagnose} />
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
						<StringsTab name='' strings={patient.treatment_summary} onAdd={this.onAddTreatmentSummary} />
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ <FormattedMessage id='Patients.tabs.files' values={{ number: <b>({patient.files.length})</b> }} /> }
						key="files">
						<FilesTab patient={patient} />
					</TabPane>
				</Tabs>
			</div>
		);
	}
}

export default PatientView;