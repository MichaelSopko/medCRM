import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { graphql, compose, withApollo } from 'react-apollo';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, notification } from 'antd';

import GET_ADMINISTRATORS_QUERY from '../../graphql/AdministratorsGet.graphql';
import ADD_ADMINISTRATOR_MUTATION from '../../graphql/AdministratorsAddMutation.graphql';
import DELETE_ADMINISTRATOR_MUTATION from '../../graphql/AdministratorsDeleteMutaion.graphql';
import EDIT_ADMINISTRATOR_MUTATION from '../../graphql/AdministratorsEditMutation.graphql';

const EntityForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {}, clinics = [], formatMessage } = props;
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
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' }),
		}) : onCancel();
		const formLayout = 'vertical';

		return (
			<Modal
				title={formatMessage({ id: isEditing ? 'Administrators.edit_header' : 'Administrators.create_header' })}
				visible={visible}
				okText={formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' })}
				onCancel={checkForConfirm}
				onOk={onSubmit}
				confirmLoading={loading}>
				<Form layout={formLayout}>
					{!isEditing && <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_email' })}
						hasFeedback
					>
						{getFieldDecorator('email', {
							validateTrigger: 'onBlur', rules: [{
								type: 'email',
								required: true,
								message: formatMessage({ id: 'common.field_email_error' }),
							}],
						})(
							<Input type='email'/>,
						)}
					</Form.Item>}
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: isEditing ? 'common.field_new_password' : 'common.field_password' })}
						hasFeedback
					>
						{getFieldDecorator('password', {
							validateTrigger: 'onBlur', rules: [{
								required: !isEditing, message: formatMessage({ id: 'common.field_password_error' }),
							},
							],
						})(
							<Input/>,
						)}
					</Form.Item>
					{!isEditing && <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Administrators.field_clinic' })}
						hasFeedback
					>
						{getFieldDecorator('clinic_id', {
							validateTrigger: 'onBlur', rules: [{
								required: true, message: formatMessage({ id: 'Administrators.field_clinic_error' }),
							}],
						})(
							<Select>
								{clinics.map(clinic => <Select.Option key={clinic.id}
								                                      value={clinic.id.toString()}>{clinic.name}</Select.Option>)}
							</Select>,
						)}
					</Form.Item>}
				</Form>
			</Modal>
		);
	},
);

class Administrators extends Component {

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
			this.form.resetFields();
		}, 300);
	};

	handleFormSubmit = () => {
		const form = this.form;
		const isEditing = !!Object.keys(this.state.activeEntity).length;
		const formatMessage = this.context.intl.formatMessage;
		const errorHandler = e => {
			this.setState({ modalLoading: false });
			console.error(e);
			let id = 'common.server_error';
			if (e.graphQLErrors) {
				const message = e.graphQLErrors[0].message;
				if (message === 'DUPLICATE_EMAIL') id = 'common.field_email_error_duplicate';
			}
			notification.error({
				message: formatMessage({ id }),
			});
		};
		form.validateFields((err, values) => {
			if (err && !isEditing) {
				return;
			}
			isEditing
				? this.props.editAdministrator({ id: this.state.activeEntity.id, ...values })
					.then(() => {
						form.resetFields();
						this.setState({ modalOpened: false, activeEntity: {} });
					}).catch(errorHandler)
				: this.props.addAdministrator(values).then(() => {
					form.resetFields();
					this.setState({ modalOpened: false, activeEntity: {} });
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
		
		return (
			<span>
				<Popconfirm title={formatMessage({id: 'common.confirm_message'})}
							onConfirm={ () => {
								this.props.deleteAdministrator(record);
							}
							} okText={formatMessage({id: 'common.confirm_yes'})}
							cancelText={formatMessage({id: 'common.confirm_no'})}>
					<Button size="small" className="btn-actions btn-delete"
							type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
				  </Popconfirm>
				</span>
		);
	};

	render() {
		const { data: { loading, administrators, clinics }, deleteAdministrator } = this.props;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_email' }),
			dataIndex: 'email',
			key: 'email',
			sorter: (a, b) => a.email > b.email,
		}, {
			title: formatMessage({ id: 'common.field_name' }),
			dataIndex: 'clinic.name',
			key: 'name',
			sorter: (a, b) => a.name > b.name,
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			render: (text, record) => (
				<span>
{/*		      <Button size="small" type='ghost' onClick={this.editEntity(record)}>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider"/>*/}
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={() => {
			      deleteAdministrator(record)
		      }} okText={formatMessage({ id: 'common.confirm_yes' })}
		                  cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size="small" type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
			        </Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { modalOpened, activeEntity } = this.state;
		const options = {
			paginationPanel: this.renderPaginationPanel,
			onRowClick: this.onRowClick,
		};
		
		return (
			<section className="Administrators">
				<div className="Container Dashboard__Content">
					<EntityForm
						ref={form => {
							this.form = form
						}}
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
							{formatMessage({ id: 'Administrators.header' })}
						</h1>
						<div className="Dashboard__Actions">
							<Button type="primary" onClick={this.showModal}>
								<Icon type="plus-circle-o"/>
								{formatMessage({ id: 'Administrators.create_button' })}
							</Button>
						</div>
					</div>
					{/*<Table
						onRowClick={(record, index, event) => {
							// dont edit when button clicked
							if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A'  || event.target.parentNode.tagName === 'BUTTON') {
								return;
							}
							this.editEntity(record);
						}} dataSource={administrators} columns={columns} loading={loading} rowKey='id'/>*/}
					
					<BootstrapTable data={administrators} keyField='id' hover consended options={options}
									pagination>
						<TableHeaderColumn dataField='email' dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_email' })}</TableHeaderColumn>
						<TableHeaderColumn dataField='clinic.name' dataSort caretRender={ getCaret }>{formatMessage({ id: 'common.field_name' })}</TableHeaderColumn>
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

const AdministratorsApollo = withApollo(compose(
	graphql(GET_ADMINISTRATORS_QUERY),
	graphql(ADD_ADMINISTRATOR_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addAdministrator: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_ADMINISTRATORS_QUERY,
				}],
			}),
		}),
	}),
	graphql(DELETE_ADMINISTRATOR_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteAdministrator: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_ADMINISTRATORS_QUERY,
				}],
			}),
		}),
	}),
	graphql(EDIT_ADMINISTRATOR_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editAdministrator: (fields) => mutate({
				variables: fields,
				refetchQueries: [{
					query: GET_ADMINISTRATORS_QUERY,
				}],
			}),
		}),
	}),
)(Administrators));

export default AdministratorsApollo;
