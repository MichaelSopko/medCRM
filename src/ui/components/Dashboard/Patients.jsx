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
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import moment from 'moment';

import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker } from 'antd'

const EntityForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {} } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Patient` }
			       visible={visible}
			       okText={ isEditing ? 'Edit' : 'Create' }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					<Form.Item
						{...formItemLayout}
						label="ID"
						hasFeedback
					>
						{getFieldDecorator('id_number', {
							initialValue: values.id_number,
							rules: [{
								type: 'regexp', pattern: /^\d+$/, required: true, message: 'Please input ID',
							}],
						})(
							<Input type="number" />
						)}
					</Form.Item>
					{ <Form.Item
						{...formItemLayout}
						label="Email"
						hasFeedback
					>
						{getFieldDecorator('email', {
							initialValue: values.email,
							rules: [{
								type: 'email', message: 'Please input email',
							}],
						})(
							<Input type="email" />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="First name"
						hasFeedback
					>
						{getFieldDecorator('first_name', {
							initialValue: values.first_name,
							rules: [{
								required: true, message: 'Please input first name',
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Last name"
						hasFeedback
					>
						{getFieldDecorator('last_name', {
							initialValue: values.last_name,
							rules: [{
								required: true, message: 'Please input last name',
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Phone"
						hasFeedback
					>
						{getFieldDecorator('phone', {
							initialValue: values.phone,
							rules: [{
								required: true, message: 'Please input phone',
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Birth date"
						hasFeedback
					>
						{getFieldDecorator('birth_date', {
							initialValue: moment(values.birth_date),
							rules: [{
								required: true, message: 'Please input date',
							}],
						})(
							<DatePicker locale="en-US"/>
						)}
					{ <Form.Item
						{...formItemLayout}
						label="Related Persons"
						hasFeedback
					>
						{getFieldDecorator('birth_date', {
							initialValue: moment(values.related_persons),
							rules: [{
								required: true, message: 'Please input date',
							}],
						})(
							<Select>
								<Select.Option></Select.Option>
							</Select>
						)}
					</Form.Item> }
					<CheckAccess role={ ROLES.CLINIC_ADMIN }>
						<Form.Item
							{...formItemLayout}
							label={ isEditing ? 'New password' : 'Password' }
							hasFeedback
						>
							{getFieldDecorator('password', {
								rules: [{
									required: !isEditing, message: 'Please input password'
								}
								],
							})(
								<Input />
							)}
						</Form.Item>
					</CheckAccess>
				</Form>
			</Modal>
		);
	}
);

class Patients extends Component {

	static propTypes = {
		data: PropTypes.object
	};

	state = {
		modalOpened: false,
		activeEntity: {}
	};

	handleOk = () => {
		this.setState({ modalOpened: false });
		this.resetActiveEntity();
	};

	handleCancel = () => {
		this.setState({ modalOpened: false });
		this.resetActiveEntity();
	};

	showModal = () => {
		this.setState({ modalOpened: true });
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
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			console.log(this.props.currentClinic);
			isEditing ?
				this.props.editPatient({ id: this.state.activeEntity.id, ...values }) :
				this.props.addPatient({ clinic_id: this.props.currentClinic.id, ...values });
			console.log('Adding new patient', values);
			form.resetFields();
			this.setState({ modalOpened: false, activeEntity: {} });
		});
	}

	editEntity = entity => () => {
		this.form.resetFields();
		this.setState({
			modalOpened: true,
			activeEntity: entity
		});
	}

	render() {
		const { data: { loading, patients }, deletePatient, currentClinic } = this.props;

		const columns = [{
			title: 'Name',
			key: 'name',
			render: (text, record) => <span>{record.first_name} {record.last_name}</span>
		}, {
			title: 'Phone',
			dataIndex: 'phone',
			key: 'phone',
			render: text => <a href={ `tel:${text}` }>{ text }</a>
		}, {
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			render: text => <a href={ `mailto:${text}` }>{ text }</a>
		}, {
			title: 'Action',
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>Edit</Button>
					<span className="ant-divider"></span>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deletePatient(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost'>Delete</Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { modalOpened, activeEntity } = this.state;

		return (
			<section className="Patients">
				<EntityForm
					ref={ form => {
						this.form = form
					} }
					visible={modalOpened}
					loading={loading}
					onCancel={this.handleCancel}
					onSubmit={this.handleFormSubmit}
					values={activeEntity}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">Patients</h1>
					<div className="Dashboard__Actions">
						<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
							<ClinicsSelector/>
						</CheckAccess>
						<Button type="primary" onClick={ this.showModal } disabled={ !currentClinic.id }>
							<Icon type="plus-circle-o"/>
							Create a Patient
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
				clinic_id: currentClinic.id || 0
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



@connect((state) => ({ currentClinic: state.currentClinic }))
class CurrentClinicWrapper extends Component {
	render() {
		return <PatientsApollo { ...this.props }/>
	}
}

export default CurrentClinicWrapper;