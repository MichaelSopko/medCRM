import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { Table, Icon, Switch, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker, notification } from 'antd'

import GET_THERAPISTS_QUERY from '../../graphql/therapists.query.graphql';
import CREATE_THERAPIST_MUTATION from '../../graphql/createTherapist.mutation.graphql';
import DELETE_THERAPIST_MUTATION from '../../graphql/deleteTherapist.mutation.gql';
import UPDATE_THERAPIST_MUTATION from '../../graphql/UpdateTherapistMutation.graphql';
import ROLES from '../../../helpers/constants/roles';
import ClinicsSelector from '../ClinicsSelector';
import CheckAccess from '../helpers/CheckAccess';

const EntityForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {}, formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			/*labelCol: { span: 6 },
			wrapperCol: { span: 14 },*/
		};
		const isEditing = !!Object.keys(values).length;
		const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
			title: formatMessage({ id: 'common.modal_save_confirm.title' }),
			onOk: onCancel,
			okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' })
		}) : onCancel();
		const formLayout = 'vertical';

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Therapists.edit_header' : 'Therapists.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={checkForConfirm}
			       onOk={onSubmit}
			       width={700}
			       confirmLoading={loading}>
				<Form layout={formLayout}>
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
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Therapists.field_title.name' })}
						hasFeedback
					>
						{getFieldDecorator('title', {
							initialValue: values.title,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Select>
								<Select.Option value={'value1'} key={'value1'}>{formatMessage({ id: `Therapists.field_title.value1` })}</Select.Option>
								<Select.Option value={'value2'} key={'value2'}>{formatMessage({ id: `Therapists.field_title.value2` })}</Select.Option>
								<Select.Option value={'value3'} key={'value3'}>{formatMessage({ id: `Therapists.field_title.value3` })}</Select.Option>
							</Select>,
						)}
					</Form.Item>
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
				this.props.updateTherapist({ id: this.state.activeEntity.id, therapist: values })
					.then(() => {
						form.resetFields();
						this.setState({ modalOpened: false, modalLoading: false, activeEntity: {} });
						this.resetActiveEntity();
					}).catch(errorHandler) :
				this.props.createTherapist(values)
					.then(() => {
						form.resetFields();
						this.setState({ modalOpened: false, modalLoading: false });
						this.resetActiveEntity();
					}).catch(errorHandler);
		});
	};

	editEntity = entity => {
		this.form.resetFields();
		this.setState({
			modalOpened: true,
			activeEntity: entity,
		});
	};
	
	onRowClick = (record, index, i, event) => {
		// dont edit when button clicked
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.parentNode.tagName === 'BUTTON') {
			return;
		}
		this.editEntity(record);
	};
	
	renderPaginationPanel = (props) => {
		return (
			<div className="pagination-block">
				{ props.components.pageList }
			</div>
		);
	};
	
	editRender = (cell, record) => {
		const formatMessage = this.context.intl.formatMessage;
		
		const onDelete = () => {
			this.props.deleteTherapist(record).then(() => {
				this.props.client.resetStore();
			});
		};
		
		const checkForConfirm = () => Modal.confirm({
			title: formatMessage({id: 'common.confirm_message'}),
			okText: formatMessage({id: 'common.confirm_yes'}),
			cancelText: formatMessage({id: 'common.confirm_no'}),
			onOk: onDelete.bind(this),
		});
		
		return (
			<span>
				<Button size="small" className="btn-actions btn-danger" onClick={checkForConfirm}
						type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
			</span>
		);
	};
	
	renderName = (text, record) => {
		return (
			<div className="to-dynamic-container">
				<span className="to-dynamic">{record.first_name} {record.last_name}</span>
			</div>
		);
	};
	
	renderTitle = (text, record) => {
		const formatMessage = this.context.intl.formatMessage;
		
		return (
			<div className="to-dynamic-container">
				<span className="to-dynamic" style={{ color: text == 'value1' ? '#d1d1d1' : 'inherit' }}>
					{formatMessage({ id: `Therapists.field_title.${text}` })}
				</span>
			</div>
		);
	};

	render() {
		const { data: { loading, therapists }, deleteTherapist, currentClinic } = this.props;
		const formatMessage = this.context.intl.formatMessage;
		const options = {
			paginationPanel: this.renderPaginationPanel,
			onRowClick: this.onRowClick,
			prePage: 'Previous', // Previous page button text
			nextPage: 'Next', // Next page button text
			alwaysShowAllBtns: true,
		};
		
		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			width: '25%',
			sorter: (a, b) => a.name > b.name,
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{record.first_name} {record.last_name}</span>
			</div>,
		}, {
			title: formatMessage({ id: 'Therapists.field_title.name' }),
			dataIndex: 'title',
			key: 'title',
			width: '15%',
			sorter: (a, b) => a.title > b.title,
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic" style={{ color: text == 'value1' ? '#d1d1d1' : 'inherit' }}>
					{formatMessage({ id: `Therapists.field_title.${text}` })}
				</span>
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
			width: '10%',
			render: (text, record) => (
				<span>
{/*		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider" />*/}
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
					{/*<Table
						onRowClick={(record, index, event) => {
							// dont edit when button clicked
							if(event.target.tagName === 'BUTTON' || event.target.tagName === 'A'  || event.target.parentNode.tagName === 'BUTTON') {
								return;
							}
							this.editEntity(record);
						}}
						dataSource={therapists} columns={columns} loading={loading} rowKey='id' />*/}
					
					<BootstrapTable data={therapists} keyField='id' hover consended options={options}
									pagination>
						<TableHeaderColumn width='25%' dataField='first_name' dataFormat={this.renderName} dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_name' })}</TableHeaderColumn>
						<TableHeaderColumn width='15%' dataField='title' dataFormat={this.renderTitle} dataSort caretRender={ getCaret }>{formatMessage({ id: 'Therapists.field_title.name' })}</TableHeaderColumn>
						<TableHeaderColumn width='25%' dataField='phone' dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_phone' })}</TableHeaderColumn>
						<TableHeaderColumn width='25%' dataField='email' dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_email' })}</TableHeaderColumn>
						<TableHeaderColumn width="100px"
							dataFormat={this.editRender.bind(this)}>{formatMessage({ id: 'common.field_actions' })}</TableHeaderColumn>
					</BootstrapTable>
				</div>
			</section>
		);
	}
}

function getCaret(direction) {
	if (direction === 'asc') {
		return (
			<span className="fa fa-sort-amount-asc"></span>
		);
	}
	if (direction === 'desc') {
		return (
			<span className="fa fa-sort-amount-desc"></span>
		);
	}
	return (
		<span className="fa fa-exchange fa-rotate-90"></span>
	);
}

const TherapistsApollo = withApollo(compose(
	graphql(GET_THERAPISTS_QUERY, {
		options: ({ currentClinic }) => ({
			variables: {
				clinic_id: currentClinic.id,
			},
		}),
	}),
	graphql(CREATE_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			createTherapist: therapist => mutate({
				variables: { clinic_id: ownProps.currentClinic.id, therapist },
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
	graphql(UPDATE_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			updateTherapist: ({ id, therapist }) => mutate({
				variables: { id, therapist },
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
