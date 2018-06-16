import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';

import {
	Icon,
	Button,
	Popconfirm,
	Checkbox,
	notification,
	message,
	Tooltip,
} from 'antd';

import PATIENTS_LIST_QUERY from '../../patient/graphql/PatientsList.graphql';
import ADD_PATIENT_MUTATION from '../../patient/graphql/PatientAddMutation.graphql';
import DELETE_PATIENT_MUTATION from '../../patient/graphql/PatientDeleteMutaion.graphql';
import EDIT_PATIENT_MUTATION from '../../patient/graphql/PatientEditMutation.graphql';

import ROLES from '../../../helpers/constants/roles';
import ClinicsSelector from '../ClinicsSelector';
import CheckAccess from '../helpers/CheckAccess';
import intersperse from '../../../utils/intersperse';
import PatientForm from '../PatientForm';
import PatientView from '../PatientView';
import PatientSelector from '../PatientSelector';

import './Patients.scss';


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
		activeKey: 'details',
	};

	constructor(props) {
		super(props);

		this.subscriptions = null;
	}

	handleOk = () => {
		this.setState({ modalOpened: false });
		this.resetActiveEntity();
	};

	handleCancel = () => {
		this.setState({ modalOpened: false, relatedPersons: [], activeKey: 'details' });
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
		
		const processRelatedPersons = (relatedPersons, values) => {
			values.related_persons = [];
			relatedPersons.forEach((person) => {
				delete person._id;
				if (person && person.name && person.type) {
					values.related_persons.push(person);
				}
			});
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
		
		const formFields = ['id_number','first_name','last_name','gender','birth_date'];

		form.validateFields((err, values) => {
			if (err) {
				let isFirstTab = false;
				for (let k in err) {
					if (err.hasOwnProperty(k) && formFields.includes(k)) {
						isFirstTab = true;
					}
				}
				if (isFirstTab) {
					this.setState({ activeKey: 'details' });
				} else {
					this.setState({ activeKey: 'related' });
				}
				return;
			}
			
			this.setState({ modalLoading: true });
			
			// const relatedPersons = values.related_persons.slice();
			const relatedPersons = this.state.relatedPersons;
			
			values = processRelatedPersons(relatedPersons, values);
			values.birth_date = moment(values.birth_date);
			
			isEditing

				? this.props.editPatient({
				id: this.state.activeEntity.id,
				patient: values,
			}).then(() => {
				form.resetFields();
				this.setState({ modalOpened: false, modalLoading: false, relatedPersons: [] });
				this.resetActiveEntity();
			}).catch(errorHandler)

				: this.props.addPatient({
				clinic_id: this.props.currentClinic.id,
				patient: values,
			}).then((res) => {
				form.resetFields();
				this.setState({
					modalOpened: false,
					modalLoading: false,
					relatedPersons: [],
					currentPatientId: res.data.addPatient.id,
					activeKey: 'details',
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
		const form = this.form;
		form.validateFields([
			'related_persons[0].name', 'related_persons[0].description',
			'related_persons[0].email', 'related_persons[0].phone',
		], (err, values) => {
			if (err) {
				return;
			}
			
			const person = values.related_persons[0];
			const relatedPersons = [
				...this.state.relatedPersons,
				Object.assign({}, { _id: Math.random().toString(36).substring(7)}, person)
			];
			this.setState({ relatedPersons });
			form.resetFields([
				'related_persons[0].type',
				'related_persons[0].name',
				'related_persons[0].description',
				'related_persons[0].email',
				'related_persons[0].phone',
				'related_persons[0].receive_updates',
			]);
		});
	};

	removeRelatedPerson = (id) => {
		let { relatedPersons } = this.state;
		relatedPersons = relatedPersons.filter(person => person._id !== id);
		this.setState({ relatedPersons });
	};

	onPatientChange = (id) => {
		this.setState({ currentPatientId: id })
	};

	onShowArchivedChange = (e) => {
		this.setState({ showArchived: e.target.checked })
	};
	
	onChangeKey = (activeKey) => {
		this.setState({ activeKey });
	};

	render() {
		const { deletePatient, currentClinic, currentUser, data } = this.props;
		const formatMessage = this.context.intl.formatMessage;
		const { modalOpened, activeEntity, modalLoading, relatedPersons,
			currentPatientId, showArchived } = this.state;
		const canAddPatient = currentClinic.id
			&& (currentUser.role === 'SYSTEM_ADMIN' || !currentClinic.patients_limit
			|| (data && data.patients && data.patients.length < currentClinic.patients_limit));

		return (
			<div className='Container Patient_container'>
				<section className='Patients'>
					<PatientForm
						ref={form => {
							this.form = form
						}}
						visible={modalOpened}
						loading={modalLoading}
						firstPageError={this.state.firstPageError}
						onCancel={this.handleCancel}
						onSubmit={this.handleFormSubmit}
						formatMessage={formatMessage}
						values={activeEntity}
						relatedPersons={relatedPersons}
						addRelatedPerson={this.addRelatedPerson}
						removeRelatedPerson={this.removeRelatedPerson}
						activeKey={this.state.activeKey}
						onChangeKey={this.onChangeKey}
						/>
					<div>
						<div className='Dashboard__Actions'>
							<div>
								<PatientSelector showArchived={showArchived} onChange={this.onPatientChange} />
								<Checkbox style={{ marginRight: 8 }} checked={showArchived}
								          onChange={this.onShowArchivedChange}>{formatMessage({ id: 'Patients.show-archived' })}</Checkbox>
							</div>
							<div className="rtl-left-actions">
								<CheckAccess role={ROLES.SYSTEM_ADMIN}>
									<ClinicsSelector />
								</CheckAccess>
								<Tooltip
									title={!canAddPatient && formatMessage({ id: 'Patients.archive_error_limit' }, { limit: currentClinic.patients_limit })}>
									<Button size='large' style={{ marginRight: 8 }} type='primary' onClick={this.showModal}
									        disabled={!canAddPatient}>
										<Icon type='plus-circle-o' />
										{formatMessage({ id: 'Patients.create_button' })}
									</Button>
								</Tooltip>
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
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(gql`
		query patients($clinic_id: ID!) {
            patients(clinic_id: $clinic_id) {
                id
            }
        }
	`, {
		options: ({ currentClinic, showArchived }) => ({
			variables: { clinic_id: currentClinic.id, archived: showArchived },
		}),
		skip: ({ currentClinic }) => !(currentClinic && currentClinic.id),
	}),
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
