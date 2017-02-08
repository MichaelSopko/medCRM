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
						label="Number"
						hasFeedback
					>
						{getFieldDecorator('treatments_number', {
							initialValue: values.treatments_number || 1,
							rules: [{
								required: true, message: 'Please input treatments number'
							}],
						})(
							<InputNumber min={1}/>
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	}
);

const TreatmentForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, therapists, patients, values = {} } = props;
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
			       width={600}
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
							<Input type="textarea" rows={3}/>
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
							<Input type="textarea" rows={3}/>
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
							<DatePicker
								showTime
								format="YYYY-MM-DD HH:mm:ss"
								locale="en"/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Select patients"
						hasFeedback
					>
						{getFieldDecorator('patient_ids', {
							initialValue: values.patients && values.patients.map(({ id }) => id),
							rules: [{
								type: 'array', required: true, message: 'Please at least one ',
							}],
						})(
							<Select multiple>
								{ patients.map(({ first_name, last_name, id }) =>
									<Select.Option key={id} value={id.toString()}>
										{first_name} {last_name}
									</Select.Option>) }
							</Select>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label="Select therapists"
						hasFeedback
					>
						{getFieldDecorator('therapist_ids', {
							initialValue: values.therapists && values.therapists.map(({ id }) => id),
							rules: [{
								type: 'array', required: true, message: 'Please at least one ',
							}],
						})(
							<Select multiple>
								{ therapists.map(({ first_name, last_name, id }) =>
									<Select.Option key={id} value={id.toString()}>
										{first_name} {last_name}
									</Select.Option>) }
							</Select>
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	}
);

const TreatmentsTable = ({ treatments, deleteTreatment, editTreatment }) => {
	const columns = [
		{ title: 'Target', dataIndex: 'target', key: 'target' },
		{ title: 'Method', dataIndex: 'method', key: 'method' },
		{ title: 'Process', dataIndex: 'process', key: 'process' },
		{
			title: 'Patients',
			dataIndex: 'patients',
			render: (text, record) =>
				<span>{ record.patients.map(user => `${user.first_name} ${user.last_name}`).join(', ') }</span>
		},
		{
			title: 'Therapists',
			dataIndex: 'therapists',
			render: (text, record) =>
				<span>{ record.therapists.map(user => `${user.first_name} ${user.last_name}`).join(', ') }</span>
		},
		{
			title: 'Action',
			key: 'action',
			render: (text, record) => (
				<span>
		      <a onClick={ editTreatment(record) }>Edit</a>
					<span className="ant-divider"></span>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deleteTreatment(record)
		      } } okText="Yes" cancelText="No">
		        <a>Delete</a>
		      </Popconfirm>
        </span>
			),
		},
	];
	return <Table
		dataSource={treatments}
		columns={columns}
		rowKey='id'/>
};


class Treatments extends Component {

	static propTypes = {
		data: PropTypes.object
	};

	state = {
		seriesModalOpened: false,
		treatmentModalOpened: false,
		activeTreatment: {},
		activeSeries: {},
		modalLoading: false
	};

	handleOk = () => {
		this.setState({ seriesModalOpened: false, treatmentModalOpened: false });
		this.resetActiveEntity();
	};

	handleCancel = () => {
		this.setState({ seriesModalOpened: false, treatmentModalOpened: false });
		this.resetActiveEntity();
	};

	showSeriesModal = () => {
		this.setState({ seriesModalOpened: true });
	};

	showTreatmentModal = record => () => {
		this.setState({ treatmentModalOpened: true, activeSeries: record });
	};

	/**
	 * Handle modal transition
	 */
	resetActiveEntity = () => {
		setTimeout(() => {
			this.setState({ activeSeries: {}, activeTreatment: {} });
		}, 300);
	};

	handleSeriesSubmit = () => {
		const form = this.seriesForm;
		const isEditing = !!Object.keys(this.state.activeSeries).length;
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			isEditing ?
				this.props.editSeries({ id: this.state.activeSeries.id, ...values }).then(() => {
					form.resetFields();
					this.setState({ seriesModalOpened: false, modalLoading: false, activeSeries: {} });
				}).catch(e => {
					console.error(e);
					this.setState({ modalLoading: false });
				}) :
				this.props.addSeries({ clinic_id: this.props.currentClinic.id, ...values }).then(() => {
					form.resetFields();
					this.setState({ seriesModalOpened: false, modalLoading: false });
				}).catch(e => {
					console.error(e);
					this.setState({ modalLoading: false });
				});

		});
	};

	handleTreatmentSubmit = () => {
		const form = this.treatmentForm;
		const isEditing = !!Object.keys(this.state.activeTreatment).length;
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			isEditing ?
				this.props.editTreatment({ id: this.state.activeTreatment.id, treatment: values }).then(() => {
					form.resetFields();
					this.setState({ treatmentModalOpened: false, modalLoading: false, activeTreatment: {} });
				}).catch(e => {
					console.error(e);
					this.setState({ modalLoading: false });
				}) :
				this.props.addTreatment({ series_id: this.state.activeSeries.id, treatment: values }).then(() => {
					form.resetFields();
					this.setState({ treatmentModalOpened: false, modalLoading: false, activeSeries: {} });
				}).catch(e => {
					console.error(e);
					this.setState({ modalLoading: false });
				});

		});
	};

	editSeries = entity => () => {
		this.seriesForm.resetFields();
		this.setState({
			seriesModalOpened: true,
			activeSeries: entity
		});
	};

	editTreatment = entity => () => {
		this.treatmentForm.resetFields();
		this.setState({
			treatmentModalOpened: true,
			activeTreatment: entity
		});
	};

	render() {
		const { data: { loading, treatmentSeries = [], patients = [], therapists = [] }, deleteTreatment, currentClinic } = this.props;

		const columns = [{
			title: 'Name',
			key: 'name',
			dataIndex: 'name'
		}, {
			title: 'Treatments number',
			key: 'treatments_number',
			dataIndex: 'treatments_number'
		}, {
			title: 'Action',
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='primary' onClick={ this.showTreatmentModal(record) }>
			      <Icon type="plus-circle-o"/>
			      Add Treatment
		      </Button>
					<span className="ant-divider"></span>
		      <Button size="small" type='ghost' onClick={ this.editSeries(record) }>Edit</Button>
					<span className="ant-divider"></span>
		      <Popconfirm title="Are you sure?" onConfirm={ () => {
			      deleteTreatment(record)
		      } } okText="Yes" cancelText="No">
		        <Button size="small" type='ghost'>Delete</Button>
		      </Popconfirm>
        </span>
			),
		}];
		const { seriesModalOpened, treatmentModalOpened, modalLoading, activeSeries, activeTreatment } = this.state;

		return (
			<section className="Treatments">
				<SeriesForm
					ref={ form => {
						this.seriesForm = form
					} }
					visible={seriesModalOpened}
					loading={modalLoading}
					onCancel={this.handleCancel}
					onSubmit={this.handleSeriesSubmit}
					values={activeSeries}
				/>
				<TreatmentForm
					ref={ form => {
						this.treatmentForm = form
					} }
					visible={treatmentModalOpened}
					loading={modalLoading}
					onCancel={this.handleCancel}
					onSubmit={this.handleTreatmentSubmit}
					values={activeTreatment}
					patients={patients}
					therapists={therapists}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">Treatment Series</h1>
					<div className="Dashboard__Actions">
						<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
							<ClinicsSelector/>
						</CheckAccess>
						<Button type="primary" onClick={ this.showSeriesModal } disabled={ !currentClinic.id }>
							<Icon type="plus-circle-o"/>
							Create a Treatment series
						</Button>
					</div>
				</div>
				<Table
					expandedRowRender={record => <TreatmentsTable treatments={record.treatments}
					                                              editTreatment={this.editTreatment}
					                                              deleteTreatment={deleteTreatment}/>
					}
					dataSource={treatmentSeries}
					columns={columns}
					loading={loading}
					rowKey='id'/>
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