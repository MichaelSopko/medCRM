import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'
import GET_CLINICS_QUERY from '../../graphql/ClinicsGet.graphql'
import ADD_CLINIC_MUTATION from '../../graphql/ClinicAddMutation.graphql'
import DELETE_CLINIC_MUTATION from '../../graphql/ClinicDeleteMutaion.graphql'
import EDIT_CLINIC_MUTATION from '../../graphql/ClinicEditMutation.graphql'

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
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Clinic` }
			       visible={visible}
			       okText={ isEditing ? 'Edit' : 'Create' }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					<Form.Item
						{...formItemLayout}
						label="Name"
						hasFeedback
					>
						{getFieldDecorator('name', {
							initialValue: values.name,
							rules: [{
								required: true, message: 'Please input clinic name',
							}],
						})(
							<Input />
						)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label="Address"
						hasFeedback
					>
						{getFieldDecorator('address', {
							initialValue: values.address,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item>
				</Form>
			</Modal>
		);
	}
);

class Clinics extends Component {

	static propTypes = {
		clinics: PropTypes.array
	};

	state = {
		modalOpened: false,
		activeEntity: {}
	};

	handleOk = () => {
		this.setState({ modalOpened: false, activeEntity: {} });
		this.props.form.submit();
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
			console.log('Adding new clinic', values);
			form.resetFields();
			this.setState({ modalOpened: false, activeEntity: {} });
		});
	}

	editEntity = entity => () => {
		this.setState({
			modalOpened: true,
			activeEntity: entity
		});
	}

	render() {
		const { data: { loading, clinics }, deleteClinic } = this.props;

		const columns = [{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		}, {
			title: 'Address',
			dataIndex: 'address',
			key: 'address',
		}, {
			title: 'Action',
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>Edit</Button>
					<span className="ant-divider"></span>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deleteClinic(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost'>Delete</Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { modalOpened, activeEntity } = this.state;

		return (
			<section className="Clinics">
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
					<h1 className="Dashboard__Header">Clinics</h1>
					<div className="Dashboard__Actions">
						<Button type="primary" onClick={ this.showModal }>Create a Clinic</Button>
					</div>
				</div>
				<Table dataSource={clinics} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const ClinicsWithApollo = withApollo(compose(
	graphql(GET_CLINICS_QUERY),
	graphql(ADD_CLINIC_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			addClinic: ({ name, address }) => mutate({
				variables: { name, address },
				refetchQueries: [{
					query: GET_CLINICS_QUERY
				}],
			})
		})
	}),
	graphql(DELETE_CLINIC_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			deleteClinic: ({ id }) => mutate({
				variables: { id },
				refetchQueries: [{
					query: GET_CLINICS_QUERY
				}],
			})
		})
	}),
	graphql(EDIT_CLINIC_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			editClinic: ({ id, name, address }) => mutate({
				variables: { id, name, address },
				refetchQueries: [{
					query: GET_CLINICS_QUERY
				}],
			})
		})
	}),
)(Clinics));

export default ClinicsWithApollo;
