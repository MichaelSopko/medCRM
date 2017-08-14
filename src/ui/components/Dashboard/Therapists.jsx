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

import { Table, Icon, Switch, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker, notification } from 'antd'

const EntityForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {}, formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;
		const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
			title: formatMessage({ id: 'common.modal_save_confirm.title' }),
			onOk: onCancel,
			okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' })
		}) : onCancel();

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Therapists.edit_header' : 'Therapists.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={checkForConfirm}
			       onOk={onSubmit}
			       width={700}
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
								required: true,
								message: formatMessage({ id: 'common.field_id_number_error' }),
							}],
						})(
							<Input type="number" />,
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
							<Input type="number" />,
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
							<Input type="email" />,
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
							<Input />,
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
							<Input />,
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
								pattern: /^\d{2,9}-?\d{2,9}?-?\d{0,9}$/,
								required: true, message: formatMessage({ id: 'common.field_phone_error' }),
							}],
						})(
							<Input />,
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_birth_date' })}
						hasFeedback
					>
						<Col span={8}>
							{getFieldDecorator('birth_date.year', {
								initialValue: values.birth_date ? moment(values.birth_date).year().toString() : undefined,
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*'
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_year' })}>
									{ new Array(100).fill(new Date().getFullYear()).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={y.toString()}>{y}</Select.Option>)
									}) }
								</Select>
							)}
						</Col>
						<Col span={6} offset={1}>
							{getFieldDecorator('birth_date.date', {
								initialValue: values.birth_date ? moment(values.birth_date).date().toString() : undefined,
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*'
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_day' })}>
									{ new Array(31).fill(1).map((_, i) => {
										const y = ++i;
										return (<Select.Option key={y} value={y.toString()}>{y}</Select.Option>)
									}) }
								</Select>
							)}
						</Col>
						<Col span={8} offset={1}>
							{getFieldDecorator('birth_date.month', {
								initialValue: values.birth_date ? moment(values.birth_date).month().toString() : undefined,
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*'
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_month' })}>
									{ new Array(12).fill(12).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={(y-1).toString()}>{moment.months()[y-1]}</Select.Option>)
									}) }
								</Select>
							)}
						</Col>

					</Form.Item> }
					<Form.Item
						{...formItemLayout}
						label={ formatMessage({ id: isEditing ? 'common.field_new_password' : 'common.field_password' }) }
						hasFeedback
					>
						{getFieldDecorator('password', {
							validateTrigger: 'onBlur', rules: [{
								required: !isEditing, message: formatMessage({ id: 'common.field_password_error' }),
							},
							],
						})(
							<Input />,
						)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_disabled' })}
					>
						{getFieldDecorator('disabled', {
							initialValue: values.disabled,
							valuePropName: 'checked',
							validateTrigger: 'onBlur', rules: [],
						})(
							<Switch/>
						)}
					</Form.Item>
				</Form>
			</Modal>
		);
	},
);

class Therapists extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};

	state = {
		modalOpened: false,
		activeEntity: {},
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
				message: formatMessage({ id }),
			});
		};

		form.validateFields((err, values) => {
			if (err) {
				return;
			}

			values.birth_date = moment(values.birth_date);

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
			activeEntity: entity,
		});
	};

	render() {
		const { data: { loading, therapists }, deleteTherapist, currentClinic } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			width: '30%',
			sorter: (a, b) => a.name > b.name,
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{record.first_name} {record.last_name}</span>
			</div>,
		}, {
			title: formatMessage({ id: 'common.field_phone' }),
			dataIndex: 'phone',
			key: 'phone',
			width: '25%',
			sorter: (a, b) => a.phone > b.phone,
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic"><a href={ `tel:${text}` }>{ text }</a></span>
			</div>,
		}, {
			title: formatMessage({ id: 'common.field_email' }),
			dataIndex: 'email',
			key: 'email',
			width: '25%',
			sorter: (a, b) => a.email > b.email,
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic"><a href={ `mailto:${text}` }>{ text }</a></span>
			</div>,
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '20%',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider" />
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
				<div className="Container Dashboard__Content">
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
								<ClinicsSelector />
							</CheckAccess>
							<Button type="primary" onClick={ this.showModal } disabled={ !currentClinic.id }>
								<Icon type="plus-circle-o" />
								{ formatMessage({ id: 'Therapists.create_button' }) }
							</Button>
						</div>
					</div>
					<Table dataSource={therapists} columns={columns} loading={loading} rowKey='id' />
				</div>
			</section>
		);
	}
}

const TherapistsApollo = withApollo(compose(
	graphql(GET_THERAPISTS_QUERY, {
		options: ({ currentClinic }) => ({
			variables: {
				clinic_id: currentClinic.id,
			},
		}),
	}),
	graphql(ADD_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addTherapist: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id,
					},
				}],
			}),
		}),
	}),
	graphql(DELETE_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteTherapist: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id,
					},
				}],
			}),
		}),
	}),
	graphql(EDIT_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editTherapist: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_THERAPISTS_QUERY,
					variables: {
						clinic_id: ownProps.currentClinic.id,
					},
				}],
			}),
		}),
	}),
)(Therapists));


@connect((state) => ({ currentClinic: state.currentClinic }))
class CurrentClinicWrapper extends Component {
	render() {
		return <TherapistsApollo { ...this.props } />
	}
}

export default CurrentClinicWrapper;
