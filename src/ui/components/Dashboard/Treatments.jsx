import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux';
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'

import GET_TREATMENTS_QUERY from '../../graphql/TreatmentsGet.graphql'
import ADD_TREATMENT_MUTATION from '../../graphql/TreatmentAddMutation.graphql'
import DELETE_TREATMENT_MUTATION from '../../graphql/TreatmentDeleteMutaion.graphql'
import EDIT_TREATMENT_MUTATION from '../../graphql/TreatmentEditMutation.graphql'
import ADD_SERIES_MUTATION from '../../graphql/TreatmentSeriesAddMutation.graphql'
import DELETE_SERIES_MUTATION from '../../graphql/TreatmentSeriesDeleteMutaion.graphql'
import EDIT_SERIES_MUTATION from '../../graphql/TreatmentSeriesEditMutation.graphql'

import ROLES from '../../../helpers/constants/roles'
import ClinicsSelector from '../ClinicsSelector'
import CheckAccess from '../helpers/CheckAccess'
import moment from 'moment';

import {
	Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker, InputNumber
} from 'antd'

const SeriesForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {} } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Series` }
			       visible={visible}
			       okText={ isEditing ? 'Edit' : 'Create' }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ <Form.Item
						{...formItemLayout}
						label="Name"
						hasFeedback
					>
						{getFieldDecorator('name', {
							initialValue: values.name,
							rules: [],
						})(
							<Input/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Name"
						hasFeedback
					>
						{getFieldDecorator('Number', {
							initialValue: values.name,
							rules: [{
								required: true, message: 'Please input treatments number'
							}],
						})(
							<InputNumber min="1"/>
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	}
);

const TreatmentForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {} } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ `${isEditing ? 'Edit' : 'Create'} Treatment` }
			       visible={visible}
			       okText={ isEditing ? 'Edit' : 'Create' }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ <Form.Item
						{...formItemLayout}
						label="Target"
						hasFeedback
					>
						{getFieldDecorator('target', {
							initialValue: values.target,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Method"
						hasFeedback
					>
						{getFieldDecorator('method', {
							initialValue: values.target,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Process"
						hasFeedback
					>
						{getFieldDecorator('process', {
							initialValue: values.target,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Parents guidance"
						hasFeedback
					>
						{getFieldDecorator('parents_guidance', {
							initialValue: values.target,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Next treatment remark"
						hasFeedback
					>
						{getFieldDecorator('next_treatment_remark', {
							initialValue: values.target,
							rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Date and time"
						hasFeedback
					>
						{getFieldDecorator('date', {
							initialValue: moment(values.date),
							rules: [{
								required: true, message: 'Please input date and time',
							}],
						})(
							<DatePicker showTime locale="en"/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Therapists"
						hasFeedback
					>
						{getFieldDecorator('therapists', {
							initialValue: moment(values.date),
							rules: [{
								required: true, message: 'Please input date',
							}],
						})(
							<Select>
								<Select.Option></Select.Option>
							</Select>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Patient"
						hasFeedback
					>
						{getFieldDecorator('patients', {
							initialValue: moment(values.date),
							rules: [{
								required: true, message: 'Please at least one ',
							}],
						})(
							<Select>
								<Select.Option></Select.Option>
							</Select>
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	}
);


class Treatments extends Component {

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
			isEditing ?
				this.props.editTreatment({ id: this.state.activeEntity.id, ...values }) :
				this.props.addTreatment({ clinic_id: this.props.currentClinic.id, ...values });
			console.log('Adding new treatment', values);
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
		const { data: { loading, treatments }, deleteTreatment, currentClinic } = this.props;

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
		      <Button size="small" type='primary' onClick={ this.editEntity(record) }>
			      <Icon type="plus-circle-o"/>
			      Add Treatment
		      </Button>
					<span className="ant-divider"></span>
		      <Button size="small" type='ghost' onClick={ this.editEntity(record) }>Edit</Button>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deleteTreatment(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost'>Delete</Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { seriesModalOpened, treatmentModalOpened, activeEntity } = this.state;

		return (
			<section className="Treatments">
				<SeriesForm
					ref={ form => {
						this.seriesForm = form
					} }
					visible={seriesModalOpened}
					loading={loading}
					onCancel={this.handleSeriesCancel}
					onSubmit={this.handleSeriesSubmit}
					values={activeEntity}
				/>
				<TreatmentForm
					ref={ form => {
						this.treatmentForm = form
					} }
					visible={treatmentModalOpened}
					loading={loading}
					onCancel={this.handleTreatmentCancel}
					onSubmit={this.handleTreatmentSubmit}
					values={activeEntity}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">Treatments</h1>
					<div className="Dashboard__Actions">
						<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
							<ClinicsSelector/>
						</CheckAccess>
						<Button type="primary" onClick={ this.showModal } disabled={ !currentClinic.id }>
							<Icon type="plus-circle-o"/>
							Create a Treatment series
						</Button>
					</div>
				</div>
				<Table dataSource={treatments} columns={columns} loading={loading} rowKey='id'/>
			</section>
		);
	}
}

const getOptions = name => ({
	props: ({ ownProps, mutate }) => ({
		[name]: (fields) => mutate({
			variables: fields,
			refetchQueries: [{
				query: GET_TREATMENTS_QUERY,
				variables: {
					clinic_id: ownProps.currentClinic.id
				}
			}],
		})
	})
});

const TreatmentsApollo = withApollo(compose(
	graphql(GET_TREATMENTS_QUERY, {
		options: ({ currentClinic }) => ({
			variables: {
				clinic_id: currentClinic.id || 0
			}
		})
	}),
	graphql(ADD_SERIES_MUTATION, getOptions('addSeries')),
	graphql(DELETE_SERIES_MUTATION, getOptions('deleteSeries')),
	graphql(EDIT_SERIES_MUTATION, getOptions('editSeries')),

	graphql(ADD_TREATMENT_MUTATION, getOptions('addTreatment')),
	graphql(DELETE_TREATMENT_MUTATION, getOptions('deleteTreatment')),
	graphql(EDIT_TREATMENT_MUTATION, getOptions('editTreatment')),
)(Treatments));


@connect((state) => ({ currentClinic: state.currentClinic }))
class CurrentClinicWrapper extends Component {
	render() {
		return <TreatmentsApollo { ...this.props }/>
	}
}

export default CurrentClinicWrapper;