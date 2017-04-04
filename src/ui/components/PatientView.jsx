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
	Spin,
	Tabs,
} from 'antd'
const TabPane = Tabs.TabPane
import { FormattedMessage } from 'react-intl'

import HEALTH_MAINTENANCES from '../../helpers/constants/health_maintenances'
import RELATED_PERSONS from '../../helpers/constants/related_persons'

import GET_PATIENT_QUERY from '../graphql/PatientGet.graphql'

import './PatientView.scss'

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


const DetailsTab = ({ patient }, context) => {
	const formatMessage = context.intl.formatMessage;

	let date = moment(patient.birth_date);
	let years = date.diff(moment(), 'years');
	let months = date.diff(moment(), 'months');
	let days = date.diff(moment(), 'days');

	return (
		<div className='Details'>
			<div className="Details__header">
				<span className="Details__name">
					{patient.first_name} {patient.last_name}
				</span>
				<span className="Details__age">
					<FormattedMessage id='Patients.age' values={{ years, months, days }} />
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

			<div className="Details__field">
				<div className="Details__field-name">{ formatMessage({ id: 'Patients.field_health_maintenance' }) }</div>
				<div className="Details__field-value">{patient.health_maintenance}</div>
			</div>

		</div>
	)
};

DetailsTab.contextTypes = {
	intl: PropTypes.object.isRequired,
}

@graphql(GET_PATIENT_QUERY, {
	options: ({ id }) => ({
		variables: { id },
	}),
	skip: ({ id }) => !id,
})
class PatientView extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	}

	render() {
		const { data, id, onEdit } = this.props;
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
							? <Button type='dashed' icon='unlock'>Unarchive</Button>
							: <Button ghost type='danger' icon='lock'>Archive</Button>
						}
						<Button icon='edit' style={{marginLeft: 8}} onClick={onEdit(patient)}>Edit</Button>
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
						Content of Tab Pane 2
					</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.treatments' }) }
						key="treatments">Content of Tab Pane 3</TabPane>
					<TabPane
						className='PatientView__Tab'
						tab={ formatMessage({ id: 'Patients.tabs.treatment_summary' }) }
						key="treatment_summary">Content of Tab Pane
						3
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