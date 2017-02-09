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
		const { visible, onCancel, onSubmit, form, loading, values = {}, clinics = [], formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Administrators.edit_header' : 'Administrators.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ !isEditing && <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_email' })}
						hasFeedback
					>
						{getFieldDecorator('email', {
							rules: [{
								type: 'email', required: true, message: formatMessage({ id: 'common.field_email_error' }),
							}],
						})(
							<Input />
						)}
					</Form.Item> }
					<Form.Item
						{...formItemLayout}
						label={ formatMessage({ id: isEditing ? 'common.field_new_password' : 'common.field_password' }) }
						hasFeedback
					>
						{getFieldDecorator('password', {
							rules: [{
								required: !isEditing, message: formatMessage({ id: 'common.field_password_error' })
							}
							],
						})(
							<Input />
						)}
					</Form.Item>
					{ !isEditing && <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Administrators.field_clinic' })}
						hasFeedback
					>
						{getFieldDecorator('clinic_id', {
							rules: [{
								required: true, message: formatMessage({ id: 'Administrators.field_clinic_error' }),
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

	static contextTypes = {
		intl: PropTypes.object.isRequired
	};

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
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_email' }),
			dataIndex: 'email',
			key: 'email',
		}, {
			title: formatMessage({ id: 'common.field_name' }),
			dataIndex: 'clinic.name',
			key: 'name',
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
			      deleteAdministrator(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })} cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size="small" type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
			        </Button>
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
					formatMessage={formatMessage}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">
						{ formatMessage({ id: 'Administrators.header' }) }
						</h1>
					<div className="Dashboard__Actions">
						<Button type="primary" onClick={ this.showModal }>
							<Icon type="plus-circle-o"/>
							{ formatMessage({ id: 'Administrators.create_button' }) }
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
