import React, { Component } from 'react';
import { graphql, compose, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import { Table, Icon, Button, Modal, Input, Form, Popconfirm, Switch } from 'antd';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import GET_CLINICS_QUERY from '../../graphql/ClinicsGet.graphql';
import ADD_CLINIC_MUTATION from '../../graphql/ClinicAddMutation.graphql';
import DELETE_CLINIC_MUTATION from '../../graphql/ClinicDeleteMutaion.graphql';
import EDIT_CLINIC_MUTATION from '../../graphql/ClinicEditMutation.graphql';

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
      cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' }),
    }) : onCancel();
    const formLayout = 'vertical';

    return (
      <Modal
        title={formatMessage({ id: isEditing ? 'Clinics.edit_header' : 'Clinics.create_header' })}
        visible={visible}
        okText={formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' })}
        onCancel={checkForConfirm}
        onOk={onSubmit}
        width={800}
        confirmLoading={loading}
      >
        <Form layout={formLayout}>
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'common.field_name' })}
            hasFeedback
          >
            {getFieldDecorator('name', {
              initialValue: values.name,
              validateTrigger: 'onBlur',
              rules: [{
                required: true,
                message: formatMessage({ id: 'common.field_name_error' }),
              }],
            })(
              <Input />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'common.field_address' })}
            hasFeedback
          >
            {getFieldDecorator('address', {
              initialValue: values.address,
              validateTrigger: 'onBlur',
              rules: [{
                required: true,
                message: formatMessage({ id: 'common.field_address_error' }),
              }],
            })(
              <Input />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'common.field_phone' })}
            hasFeedback
            type="tel"
          >
            {getFieldDecorator('phone', {
              initialValue: values.phone,
              validateTrigger: 'onBlur',
              rules: [{
                pattern: /^\d{2,9}-?\d{2,9}?-?\d{0,9}$/,
                number: true,
                message: formatMessage({ id: 'common.field_phone_error' }),
              }],
            })(
              <Input />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'common.field_fax' })}
            hasFeedback
          >
            {getFieldDecorator('fax', {
              initialValue: values.fax,
              validateTrigger: 'onBlur',
              rules: [],
            })(
              <Input />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'common.field_email' })}
            hasFeedback
          >
            {getFieldDecorator('email', {
              initialValue: values.email,
              validateTrigger: 'onBlur',
              rules: [{
                type: 'email',
                message: formatMessage({ id: 'common.field_email_error' }),
              }],
            })(
              <Input type="email" />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'Clinics.field_treatment_duration' })}
            hasFeedback
          >
            {getFieldDecorator('treatment_duration', {
              initialValue: values.treatment_duration,
              validateTrigger: 'onBlur',
              rules: [{
                required: true,
              }],
            })(
              <Input type="number" />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'Clinics.field_patients_limit' })}
            hasFeedback
          >
            {getFieldDecorator('patients_limit', {
              initialValue: values.patients_limit,
              validateTrigger: 'onBlur',
              rules: [{
                required: true,
              }],
            })(
              <Input type="number" />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'Clinics.field_archive_time' })}
            hasFeedback
          >
            {getFieldDecorator('archive_time', {
              initialValue: values.archive_time,
              validateTrigger: 'onBlur',
              rules: [{
                required: true,
              }],
            })(
              <Input type="number" />,
            )}
          </Form.Item >
          <Form.Item
            {...formItemLayout}
            label={formatMessage({ id: 'common.field_disabled' })}
          >
            {getFieldDecorator('disabled', {
              initialValue: values.disabled,
              validateTrigger: 'onBlur',
              rules: [],
            })(
              <Switch />,
            )}
          </Form.Item >
        </Form >
      </Modal >
    );
  },
);

class Clinics extends Component {
	
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
		this.setState({
			modalOpened: false,
			activeEntity: {},
		});
		this.props.form.submit();
	};
	
	handleCancel = () => {
		this.setState({
			modalOpened: false,
			activeEntity: {},
		});
		this.form.resetFields();
	};
	
	showModal = () => {
		this.setState({modalOpened: true});
	};
	
	handleFormSubmit = () => {
		const form = this.form;
		const isEditing = !!Object.keys(this.state.activeEntity).length;
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			isEditing
				? this.props.editClinic({
				id: this.state.activeEntity.id,
				clinic: values,
			})
				: this.props.addClinic({clinic: values});
			console.log('Adding new clinic', values);
			form.resetFields();
			this.setState({
				modalOpened: false,
				activeEntity: {},
			});
		});
	};
	
	editEntity = entity => {
		this.setState({
			modalOpened: true,
			activeEntity: entity,
		});
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
								this.props.deleteClinic(record).then(() => {
									this.props.client.resetStore();
								})
							} } okText={formatMessage({id: 'common.confirm_yes'})}
							cancelText={formatMessage({id: 'common.confirm_no'})}>
					<Button size="small" className="btn-actions btn-danger"
							type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
				  </Popconfirm>
				</span>
		);
	};
	
	onRowClick = (record, index, i, event) => {
		// dont edit when button clicked
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.parentNode.tagName === 'BUTTON') {
			return;
		}
		this.editEntity(record);
	};
	
	render() {
		const {data: {loading, clinics}, deleteClinic} = this.props;
		const formatMessage = this.context.intl.formatMessage;
		
		const columns = [{
			title: formatMessage({id: 'common.field_name'}),
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name > b.name,
			filterIcon: <Icon type="smile-o" style={{color: '#aaa'}}/>,
		}, {
			title: formatMessage({id: 'common.field_address'}),
			dataIndex: 'address',
			key: 'address',
			sorter: (a, b) => a.address > b.address,
			filterIcon: <Icon type="smile-o" style={{color: '#108ee9'}}/>,
		}, {
			title: formatMessage({id: 'common.field_phone'}),
			dataIndex: 'phone',
			key: 'phone',
			sorter: (a, b) => a.phone > b.phone,
			render: text => <a href={ `tel:${text}` }>{ text }</a>,
			sorterIcon: <Icon type="smile-o" style={{color: '#aaa'}}/>,
		}, {
			title: formatMessage({id: 'common.field_email'}),
			dataIndex: 'email',
			key: 'email',
			
		}, {
			title: formatMessage({id: 'common.field_actions'}),
			key: 'action',
			render: (text, record) => (
				<span>
					{/* <Button size="small" type='ghost' onClick={ this.editEntity(record) }>
					 {formatMessage({ id: 'common.action_edit' })}
					 </Button>
					 <span className="ant-divider"></span>*/
					}
					<Popconfirm title={formatMessage({id: 'common.confirm_message'})}
								onConfirm={ () => {
									deleteClinic(record).then(() => {
										this.props.client.resetStore();
									})
								} } okText={formatMessage({id: 'common.confirm_yes'})}
								cancelText={formatMessage({id: 'common.confirm_no'})}>
					<Button size="small"
							type='ghost'>{formatMessage({id: 'common.action_delete'})}</Button>
				  </Popconfirm>
				</span>
			),
		}];
		const {modalOpened, activeEntity} = this.state;
		const options = {
			paginationPanel: this.renderPaginationPanel,
			onRowClick: this.onRowClick,
		};
		
		return (
			<section className="Clinics">
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
							{ formatMessage({id: 'Clinics.header'}) }
						</h1>
						<div className="Dashboard__Actions">
							<Button type="primary" onClick={ this.showModal }>
								<Icon type="plus-circle-o"/>
								{ formatMessage({id: 'Clinics.create_button'}) }
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
					 dataSource={clinics} columns={columns} loading={loading} rowKey='id'
					 />*/}
					
					<BootstrapTable data={clinics} keyField='id' hover consended options={options}
									pagination>
						<TableHeaderColumn dataField='name' dataSort caretRender={ getCaret }>{formatMessage({id: 'common.field_name'})}</TableHeaderColumn>
						<TableHeaderColumn dataField='address' dataSort caretRender={ getCaret }>{formatMessage({id: 'common.field_address'})}</TableHeaderColumn>
						<TableHeaderColumn dataField='phone' dataSort caretRender={ getCaret }>{formatMessage({id: 'common.field_phone'})}</TableHeaderColumn>
						<TableHeaderColumn dataField='email' dataSort caretRender={ getCaret }>{formatMessage({id: 'common.field_email'})}</TableHeaderColumn>
						<TableHeaderColumn width="100px"
							dataFormat={this.editRender.bind(this)}>{formatMessage({id: 'common.field_actions'})}</TableHeaderColumn>
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

const ClinicsWithApollo = withApollo(compose(
  graphql(GET_CLINICS_QUERY),
  graphql(ADD_CLINIC_MUTATION, {
    props: ({ ownProps, mutate }) => ({
      addClinic: fields => mutate({
        variables: fields,
        refetchQueries: [{
          query: GET_CLINICS_QUERY,
        }],
      }),
    }),
  }),
  graphql(DELETE_CLINIC_MUTATION, {
    props: ({ ownProps, mutate }) => ({
      deleteClinic: ({ id }) => mutate({
        variables: { id },
        refetchQueries: [{
          query: GET_CLINICS_QUERY,
        }],
      }),
    }),
  }),
  graphql(EDIT_CLINIC_MUTATION, {
    props: ({ ownProps, mutate }) => ({
      editClinic: fields => mutate({
        variables: fields,
        refetchQueries: [{
          query: GET_CLINICS_QUERY,
        }],
      }),
    }),
  }),
)(Clinics));

export default ClinicsWithApollo;
