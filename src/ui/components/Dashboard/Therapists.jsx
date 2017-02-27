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
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import moment from 'moment';

import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker, notification } from 'antd'

const EntityForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {}, formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Therapists.edit_header' : 'Therapists.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
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
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_licence' })}
						hasFeedback
					>
						{getFieldDecorator('license_number', {
							initialValue: values.license_number,
							validateTrigger: 'onBlur', rules: [{
								type: 'regexp',
								pattern: /^\d+$/,
								required: true,
								message: formatMessage({ id: 'common.field_licence_error' }),
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
								type: 'email', required: true, message: formatMessage({ id: 'common.field_email_error' }),
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
							<Input type="number" />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_birth_date' })}
						hasFeedback
					>
						{getFieldDecorator('birth_date', {
							initialValue: moment(values.birth_date),
							validateTrigger: 'onBlur', rules: [{
								required: true, message: formatMessage({ id: 'common.field_birth_date_error' }),
							}],
						})(
							<DatePicker/>
						)}
					</Form.Item> }
					<Form.Item
						{...formItemLayout}
						label={ formatMessage({ id: isEditing ? 'common.field_new_password' : 'common.field_password' }) }
						hasFeedback
					>
						{getFieldDecorator('password', {
							validateTrigger: 'onBlur', rules: [{
								required: !isEditing, message: formatMessage({ id: 'common.field_password_error' })
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
		this.form.resetFields();
	};

	handleFormSubmit = () => {
		const formatMessage = this.context.intl.formatMessage;
		const form = this.form;
		const isEditing = !!Object.keys(this.state.activeEntity).length;
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
				message: formatMessage({ id })
			});
		};

		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			isEditing ?
				this.props.editTherapist({ id: this.state.activeEntity.id, ...values })
					.then(() => {
						form.resetFields();
						this.setState({ modalOpened: false, modalLoading: false, activeEntity: {} });
						this.resetActiveEntity();
					}).catch(errorHandler) :
				this.props.addTherapist({ clinic_id: this.props.currentClinic.id, ...values })
					.then(() => {
						form.resetFields();
						this.setState({ modalOpened: false, modalLoading: false });
						this.resetActiveEntity();
					}).catch(errorHandler);
		});
	};

	editEntity = entity => () => {
		this.form.resetFields();
		this.setState({
			modalOpened: true,
			activeEntity: entity
		});
	};

	render() {
		const { data: { loading, therapists }, deleteTherapist, currentClinic } = this.props;
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
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider"/>
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deleteTherapist(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })}
		                  cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size="small" type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
			        </Button>
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
					formatMessage={formatMessage}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">
						{ formatMessage({ id: 'Therapists.header' }) }
					</h1>
					<div className="Dashboard__Actions">
						<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
							<ClinicsSelector/>
						</CheckAccess>
						<Button type="primary" onClick={ this.showModal } disabled={ !currentClinic.id }>
							<Icon type="plus-circle-o"/>
							{ formatMessage({ id: 'Therapists.create_button' }) }
						</Button>
					</div>
				</div>
				<Table dataSource={therapists} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const TherapistsApollo = withApollo(compose(
	graphql(GET_THERAPISTS_QUERY, {
		options: ({ currentClinic }) => ({
			variables: {
				clinic_id: currentClinic.id
			}
		})
	}),
	graphql(ADD_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addTherapist: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id
					}
				}],
			})
		})
	}),
	graphql(DELETE_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteTherapist: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id
					}
				}],
			})
		})
	}),
	graphql(EDIT_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editTherapist: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id
					}
				}],
			})
		})
	}),
)(Therapists));


@connect((state) => ({ currentClinic: state.currentClinic }))
class CurrentClinicWrapper extends Component {
	render() {
		return <TherapistsApollo { ...this.props }/>
	}
}

export default CurrentClinicWrapper;
