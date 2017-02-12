import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import GET_PATIENTS_QUERY from '../../graphql/PatientsGet.graphql'
import ADD_PATIENT_MUTATION from '../../graphql/PatientAddMutation.graphql'
import DELETE_PATIENT_MUTATION from '../../graphql/PatientDeleteMutaion.graphql'
import EDIT_PATIENT_MUTATION from '../../graphql/PatientEditMutation.graphql'
import ROLES from '../../../helpers/constants/roles'
import HEALTH_MAINTENANCES from '../../../helpers/constants/health_maintenances'
import RELATED_PERSONS from '../../../helpers/constants/related_persons'
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker, Upload } from 'antd'

import './Patients.scss'

/* intersperse: Return an array with the separator interspersed between
 * each element of the input array.
 *
 * @url http://stackoverflow.com/a/23619085
 *
 * > _([1,2,3]).intersperse(0)
 * [1,0,2,0,3]
 */
function intersperse(arr, sep) {
	if (arr.length === 0) {
		return [];
	}

	return arr.slice(1).reduce(function(xs, x, i) {
		return xs.concat([sep, x]);
	}, [arr[0]]);
}

const EntityForm = Form.create()(
	(props) => {
		const {
			visible, onCancel, onSubmit, form, loading, values = {},
			onUploadFileChange, addRelatedPerson, relatedPersonsCount, formatMessage
		} = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;
		const token = localStorage.getItem('token');
		const uploadHeaders = {
			Authorization: `Bearer ${token}`
		};
		const normFile = (e) => {
			if (Array.isArray(e)) {
				return e;
			}
			return e && e.fileList;
		};

		let relatedPersonsItems = [];
		for (let i = 0; i < relatedPersonsCount; i++) {
			const item = (values.related_persons && values.related_persons[i]) ? values.related_persons[i] : {};
			relatedPersonsItems.push(<div className="Patients__RelatedPersonsItem ant-form" key={i}>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${i}-type`, {
						initialValue: item.type,
						validateTrigger: 'onBlur', rules: [{ required: true, message: formatMessage({ id: 'Patients.field_person_type_error' }) }],
					})(
						<Select placeholder={formatMessage({ id: 'Patients.field_person_type' })}>
							{ Object.keys(RELATED_PERSONS).map(key => <Select.Option value={key} key={key}>
								{RELATED_PERSONS[key]}
							</Select.Option>) }
						</Select>
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${i}-description`, {
						initialValue: item.description,
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input placeholder={formatMessage({ id: 'Patients.field_person_description' })}/>
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${i}-phone`, {
						initialValue: item.phone,
						validateTrigger: 'onBlur', rules: [{ required: true, message: formatMessage({ id: 'common.field_phone_error' }) }],
					})(
						<Input placeholder={formatMessage({ id: 'common.field_phone' })}/>
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${i}-email`, {
						initialValue: item.email,
						validateTrigger: 'onBlur', rules: [{ type: 'email', message: formatMessage({ id: 'common.field_email_error' }) }],
					})(
						<Input type="email" placeholder={formatMessage({ id: 'common.field_email' })}/>
					)}
				</Form.Item>
			</div>)
		}

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Patients.edit_header' : 'Patients.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       width={600}
			       confirmLoading={loading}>
				<Form>
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_id_number' })}
						hasFeedback
					>
						{getFieldDecorator('id_number', {
							initialValue: values.id_number,
							validateTrigger: 'onBlur', rules: [{
								type: 'regexp',
								pattern: /^\d+$/,
								required: true,
								message: formatMessage({ id: 'common.field_id_number_error' }),
							}],
						})(
							<Input type="number"/>
						)}
					</Form.Item>
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_email' })}
						hasFeedback
					>
						{getFieldDecorator('email', {
							initialValue: values.email,
							validateTrigger: 'onBlur', rules: [{
								type: 'email', message: formatMessage({ id: 'common.field_email_error' }),
							}],
						})(
							<Input type="email"/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_first_name' })}
						hasFeedback
					>
						{getFieldDecorator('first_name', {
							initialValue: values.first_name,
							validateTrigger: 'onBlur', rules: [{
								required: true, message: formatMessage({ id: 'common.field_first_name_error' }),
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_last_name' })}
						hasFeedback
					>
						{getFieldDecorator('last_name', {
							initialValue: values.last_name,
							validateTrigger: 'onBlur', rules: [{
								required: true, message: formatMessage({ id: 'common.field_last_name_error' }),
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_phone' })}
						hasFeedback
					>
						{getFieldDecorator('phone', {
							initialValue: values.phone,
							validateTrigger: 'onBlur', rules: [{
								required: true, message: formatMessage({ id: 'common.field_phone_error' }),
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.field_health_maintenance' })}
						hasFeedback
					>
						{getFieldDecorator('health_maintenance', {
							initialValue: values.health_maintenance,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Select>
								{ Object.keys(HEALTH_MAINTENANCES).map(key => <Select.Option value={key} key={key}>
									{HEALTH_MAINTENANCES[key]}
								</Select.Option>) }
							</Select>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_birth_date' })}
						hasFeedback
					>
						{getFieldDecorator('birth_date', {
							initialValue: values.birth_date ? moment(values.birth_date) : null,
							validateTrigger: 'onBlur', rules: [{
								required: true, message: formatMessage({ id: 'common.field_birth_date_error' }),
							}],
						})(
							<DatePicker/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.field_related_persons' })}
						hasFeedback
					>
						{ relatedPersonsItems }
						<Button type="dashed" onClick={ addRelatedPerson }>
							{formatMessage({ id: 'Patients.add_related_persons' })}
						</Button>
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Files"
						hasFeedback
					>
						{getFieldDecorator('files', {
							valuePropName: 'fileList',
							initialValue: values.files && values.files.map(f => ({ uid: f.url, ...f })),
							normalize: normFile,
						})(
							<Upload
								headers={uploadHeaders}
								onChange={onUploadFileChange}
								action="/api/upload-file">
								<Button>
									<Icon type="upload"/> {formatMessage({ id: 'Patients.upload_files' })}
								</Button>
							</Upload>
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	}
);

class Patients extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired
	};

	static propTypes = {
		data: PropTypes.object
	};

	state = {
		modalOpened: false,
		activeEntity: {},
		modalLoading: false,
		relatedPersonsCount: 0
	};

	handleOk = () => {
		this.setState({ modalOpened: false });
		this.resetActiveEntity();
	};

	handleCancel = () => {
		this.setState({ modalOpened: false, relatedPersonsCount: 0 });
		this.resetActiveEntity();
	};

	showModal = () => {
		this.setState({ modalOpened: true, relatedPersonsCount: 0 });
	};

	/**
	 * Handle modal transition
	 */
	resetActiveEntity = () => {
		setTimeout(() => {
			this.setState({ activeEntity: false });
		}, 300);
	};

	handleFormSubmit = () => {
		const form = this.form;
		const isEditing = !!Object.keys(this.state.activeEntity).length;
		const processFiles = files => files.map(file => {
			file = file.response ? file.response.files[0] : file; // Handle new uploaded files
			const { name, url, size, type } = file;
			return {
				name,
				url,
				size,
				type
			}
		});
		const processRelatedPersons = (count, values) => {
			values.related_persons = [];
			for (let i = 0; i < count; i++) {
				const type = values[`related_persons-${i}-type`];
				delete values[`related_persons-${i}-type`];
				const phone = values[`related_persons-${i}-phone`];
				delete values[`related_persons-${i}-phone`];
				const email = values[`related_persons-${i}-email`];
				delete values[`related_persons-${i}-email`];
				const description = values[`related_persons-${i}-description`];
				delete values[`related_persons-${i}-description`];
				values.related_persons.push({ type, phone, email, description });
			}
			return values;
		};

		form.validateFields((err, { files, ...values }) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			console.log(values);
			files = files ? processFiles(files) : [];
			values = processRelatedPersons(this.state.relatedPersonsCount, values);
			isEditing ?
				this.props.editPatient({
					id: this.state.activeEntity.id,
					patient: {
						...values,
						files
					}
				}).then(() => {
					form.resetFields();
					this.setState({ modalOpened: false, modalLoading: false, relatedPersonsCount: 0 });
					this.resetActiveEntity();
				}).catch(e => {
					this.setState({ modalLoading: false });
					console.log(e);
				}) :
				this.props.addPatient({
					clinic_id: this.props.currentClinic.id,
					patient: {
						...values,
						files
					}
				}).then(() => {
					form.resetFields();
					this.setState({ modalOpened: false, modalLoading: false, relatedPersonsCount: 0 });
				}).catch(e => {
					this.setState({ modalLoading: false });
					console.log(e);
				});
		});
	};

	editEntity = entity => () => {
		this.form.resetFields();
		this.setState({
			modalOpened: true,
			activeEntity: entity,
			relatedPersonsCount: entity.related_persons ? entity.related_persons.length : 0
		});
	};

	onUploadFileChange = info => {

	};

	addRelatedPerson = relatedPersons => {
		this.setState({ relatedPersonsCount: this.state.relatedPersonsCount + 1 });
	};

	render() {
		const { data: { loading, patients }, deletePatient, currentClinic } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			render: (text, record) => <span>{record.first_name} {record.last_name}</span>
		}, {
			title: formatMessage({ id: 'common.field_phone' }),
			dataIndex: 'phone',
			key: 'phone',
			render: text => <a href={ `tel:${text}` }>{ text }</a>
		}, {
			title: formatMessage({ id: 'common.field_email' }),
			dataIndex: 'email',
			key: 'email',
			render: text => <a href={ `mailto:${text}` }>{ text }</a>
		}, {
			title: '',
			dataIndex: 'files',
			key: 'files',
			render: (text, record) => intersperse(record.files.map(file => <a href={file.url}>{file.name}</a>), ", ")
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider"/>
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deletePatient(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })} cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size="small" type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
			        </Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { modalOpened, activeEntity, modalLoading, relatedPersonsCount } = this.state;

		return (
			<section className="Patients">
				<EntityForm
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
					relatedPersonsCount={relatedPersonsCount}
					addRelatedPerson={this.addRelatedPerson}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">
						{ formatMessage({ id: 'Patients.header' }) }
						</h1>
					<div className="Dashboard__Actions">
						<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
							<ClinicsSelector/>
						</CheckAccess>
						<Button type="primary" onClick={ this.showModal } disabled={ !currentClinic.id }>
							<Icon type="plus-circle-o"/>
							{ formatMessage({ id: 'Patients.create_button' }) }
						</Button>
					</div>
				</div>
				<Table dataSource={patients} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const PatientsApollo = withApollo(compose(
	graphql(GET_PATIENTS_QUERY, {
		options: ({ currentClinic }) => ({
			variables: {
				clinic_id: currentClinic.id
			}
		})
	}),
	graphql(ADD_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addPatient: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_PATIENTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id
					}
				}],
			})
		})
	}),
	graphql(DELETE_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deletePatient: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_PATIENTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id
					}
				}],
			})
		})
	}),
	graphql(EDIT_PATIENT_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editPatient: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_PATIENTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id
					}
				}],
			})
		})
	}),
)(Patients));


// TODO: migrate to clean redux connector
@connect((state) => ({ currentClinic: state.currentClinic }))
class CurrentClinicWrapper extends Component {
	render() {
		return <PatientsApollo { ...this.props }/>
	}
}

export default CurrentClinicWrapper;