import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import GET_ADMINISTRATORS_QUERY from '../../graphql/AdministratorsGet.graphql'
import ADD_ADMINISTRATOR_MUTATION from '../../graphql/AdministratorsAddMutation.graphql'
import DELETE_ADMINISTRATOR_MUTATION from '../../graphql/AdministratorsDeleteMutaion.graphql'
import EDIT_ADMINISTRATOR_MUTATION from '../../graphql/AdministratorsEditMutation.graphql'
import ROLES from '../../../helpers/constants/roles'

import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select } from 'antd'

const EntityForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {}, clinics = [] } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Administrator` }
			       visible={visible}
			       okText={ isEditing ? 'Edit' : 'Create' }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ !isEditing && <Form.Item
						{...formItemLayout}
						label="Email"
						hasFeedback
					>
						{getFieldDecorator('email', {
							rules: [{
								type: 'email', required: true, message: 'Please input email',
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					{ /* <Form.Item
					 {...formItemLayout}
					 label="Name"
					 hasFeedback
					 >
					 {getFieldDecorator('first_name', {
					 initialValue: values.first_name,
					 rules: [],
					 })(
					 <Input />
					 )}
					 </Form.Item> */ }
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
					{ !isEditing && <Form.Item
						{...formItemLayout}
						label="Clinic"
						hasFeedback
					>
						{getFieldDecorator('clinic_id', {
							rules: [{
								required: true, message: 'Please choose a clinic',
							}],
						})(
							<Select>
								{ clinics.map(clinic => <Select.Option key={clinic.id}
								                                       value={clinic.id.toString()}>{ clinic.name }</Select.Option>) }
							</Select>
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	}
);

class Administrators extends Component {

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
			isEditing ? this.props.editAdministrator({ id: this.state.activeEntity.id, ...values }) : this.props.addAdministrator(values);
			console.log('Adding new administrator', values);
			form.resetFields();
			this.setState({ modalOpened: false, activeEntity: {} });
		});
	};

	editEntity = entity => () => {
		this.form.resetFields();
		this.setState({
			modalOpened: true,
			activeEntity: entity
		});
	}

	render() {
		const { data: { loading, administrators, clinics }, deleteAdministrator } = this.props;

		const columns = [{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
		}, {
			title: 'Clinic',
			dataIndex: 'clinic.name',
			key: 'name',
		}, {
			title: 'Action',
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>Edit</Button>
					<span className="ant-divider"></span>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deleteAdministrator(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost'>Delete</Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { modalOpened, activeEntity } = this.state;

		return (
			<section className="Administrators">
				<EntityForm
					ref={ form => {
						this.form = form
					} }
					visible={modalOpened}
					loading={loading}
					onCancel={this.handleCancel}
					onSubmit={this.handleFormSubmit}
					clinics={clinics}
					values={activeEntity}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">Administrators</h1>
					<div className="Dashboard__Actions">
						<Button type="primary" onClick={ this.showModal }>
							<Icon type="plus-circle-o"/>
							Create an Administrator
						</Button>
					</div>
				</div>
				<Table dataSource={administrators} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const AdministratorsApollo = withApollo(compose(
	graphql(GET_ADMINISTRATORS_QUERY),
	graphql(ADD_ADMINISTRATOR_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addAdministrator: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_ADMINISTRATORS_QUERY
				}],
			})
		})
	}),
	graphql(DELETE_ADMINISTRATOR_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteAdministrator: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_ADMINISTRATORS_QUERY
				}],
			})
		})
	}),
	graphql(EDIT_ADMINISTRATOR_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editAdministrator: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_ADMINISTRATORS_QUERY
				}],
			})
		})
	}),
)(Administrators));

export default AdministratorsApollo;
