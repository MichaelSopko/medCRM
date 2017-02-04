import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import GET_USERS_QUERY from '../../graphql/UsersGet.graphql'
import ADD_USER_MUTATION from '../../graphql/UserAddMutation.graphql'
import DELETE_USER_MUTATION from '../../graphql/UserDeleteMutaion.graphql'
import EDIT_USER_MUTATION from '../../graphql/UserEditMutation.graphql'
import ROLES from '../../../helpers/roles'

import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm } from 'antd'

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
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Administrator` }
			       visible={visible}
			       okText={ isEditing ? 'Edit' : 'Create' }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ !isEditing && <Form.Item
						{...formItemLayout}
						label="Login"
						hasFeedback
					>
						{getFieldDecorator('login', {
							rules: [{
								required: true, message: 'Please input login',
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					<Form.Item
						{...formItemLayout}
						label="Name"
						hasFeedback
					>
						{getFieldDecorator('name', {
							initialValue: values.name,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={ isEditing ? 'New password' : 'Password' }
						hasFeedback
					>
						{getFieldDecorator('password', {
							rules: [{
									required: !isEditing,  message: 'Please input password'
								}
							],
						})(
							<Input />
						)}
					</Form.Item>
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
		this.setState({ modalOpened: false, activeEntity: {} });
		// this.props.form.submit();
	};

	handleCancel = () => {
		this.setState({ modalOpened: false, activeEntity: {} });
	};

	showModal = () => {
		this.setState({ modalOpened: true });
	};

	handleFormSubmit = () => {
		const form = this.form;
		const isEditing = !!Object.keys(this.state.activeEntity).length;
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			isEditing ? this.props.editClinic({ id: this.state.activeEntity.id, ...values }) : this.props.addClinic(values);
			console.log('Adding new administrator', values);
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
		const { data: { loading, users }, deleteUser } = this.props;

		const columns = [{
			title: 'Login',
			dataIndex: 'login',
			key: 'login',
		}, {
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		}, {
			title: 'Action',
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>Edit</Button>
					<span className="ant-divider"></span>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deleteUser(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost' disabled>Delete</Button>
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
				<Table dataSource={users} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const AdministratorsApollo = withApollo(compose(
	graphql(GET_USERS_QUERY, {
		options: (props) => ({ variables: { role: ROLES.CLINIC_ADMIN } })
	}),
	graphql(ADD_USER_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addClinic: ({ name, address }) => mutate({
				variables: { name, address },
				refetchQueries: [{
					query: GET_USERS_QUERY
				}],
			})
		})
	}),
	graphql(DELETE_USER_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteClinic: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_USERS_QUERY
				}],
			})
		})
	}),
	graphql(EDIT_USER_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editClinic: ({ id, name, address }) => mutate({
				variables: { id, name, address },
				refetchQueries: [{
					query: GET_USERS_QUERY
				}],
			})
		})
	}),
)(Administrators));

export default AdministratorsApollo;
