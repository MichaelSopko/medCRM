import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import GET_THERAPISTS_QUERY from '../../graphql/TherapistsGet.graphql'
import ADD_THERAPIST_MUTATION from '../../graphql/TherapistAddMutation.graphql'
import DELETE_THERAPIST_MUTATION from '../../graphql/TherapistDeleteMutaion.graphql'
import EDIT_THERAPIST_MUTATION from '../../graphql/TherapistEditMutation.graphql'
import ROLES from '../../../helpers/constants/roles'

import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select } from 'antd'

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
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Therapist` }
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
				</Form>
			</Modal>
		);
	}
);

class Therapists extends Component {

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
			isEditing ? this.props.editTherapist({ id: this.state.activeEntity.id, ...values }) : this.props.addTherapist(values);
			console.log('Adding new therapist', values);
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
		const { data: { loading, therapists }, deleteTherapist } = this.props;

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
			      deleteTherapist(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost'>Delete</Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { modalOpened, activeEntity } = this.state;

		return (
			<section className="Therapists">
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
					<h1 className="Dashboard__Header">Therapists</h1>
					<div className="Dashboard__Actions">
						<Button type="primary" onClick={ this.showModal }>
							<Icon type="plus-circle-o"/>
							Create a Therapist
						</Button>
					</div>
				</div>
				<Table dataSource={therapists} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const TherapistsApollo = withApollo(compose(
	graphql(GET_THERAPISTS_QUERY),
	graphql(ADD_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addAdministrator: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY
				}],
			})
		})
	}),
	graphql(DELETE_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteAdministrator: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY
				}],
			})
		})
	}),
	graphql(EDIT_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editAdministrator: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY
				}],
			})
		})
	}),
)(Therapists));

export default TherapistsApollo;
