import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
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
import moment from 'moment'

import './Treatments.scss'

import {
	Table, Icon, Button, Modal, Input, Form, Row, Col, Popconfirm, Select, DatePicker, InputNumber, notification
} from 'antd'

const SeriesForm = Form.create()(
	(props) => {
		const { visible, onCancel, onSubmit, form, loading, values = {}, formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Treatments.edit_header' : 'Treatments.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_name' })}
						hasFeedback
					>
						{getFieldDecorator('name', {
							initialValue: values.name,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_treatments_number' })}
						hasFeedback
					>
						{getFieldDecorator('treatments_number', {
							initialValue: values.treatments_number || 1,
							rules: [{
								required: true, message: formatMessage({ id: 'Treatments.field_treatments_number_error' })
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
		const { visible, onCancel, onSubmit, form, loading, therapists, patients, values = {}, formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Treatments.edit_header' : 'Treatments.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       width={600}
			       confirmLoading={loading}>
				<Form>
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_target' })}
						hasFeedback
					>
						{getFieldDecorator('target', {
							initialValue: values.target,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_method' })}
						hasFeedback
					>
						{getFieldDecorator('method', {
							initialValue: values.method,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_process' })}
						hasFeedback
					>
						{getFieldDecorator('process', {
							initialValue: values.process,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input />
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_parents_guidance' })}
						hasFeedback
					>
						{getFieldDecorator('parents_guidance', {
							initialValue: values.parents_guidance,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input type="textarea" rows={3}/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_next_treatment_remark' })}
						hasFeedback
					>
						{getFieldDecorator('next_treatment_remark', {
							initialValue: values.next_treatment_remark,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input type="textarea" rows={3}/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_datetime' })}
						hasFeedback
					>
						{getFieldDecorator('date', {
							initialValue: moment(values.date),
							validateTrigger: 'onBlur', rules: [],
						})(
							<DatePicker
								showTime
								format="YYYY-MM-DD HH:mm:ss"/>
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_patients' })}
						hasFeedback
					>
						{getFieldDecorator('patient_ids', {
							initialValue: values.patients && values.patients.map(({ id }) => id.toString()),
							validateTrigger: 'onBlur', rules: [{
								type: 'array', required: true, message: formatMessage({ id: 'Treatments.field_patients_error' }),
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
						label={formatMessage({ id: 'Treatments.field_therapists' })}
						hasFeedback
					>
						{getFieldDecorator('therapist_ids', {
							initialValue: values.therapists && values.therapists.map(({ id }) => id.toString()),
							validateTrigger: 'onBlur', rules: [{
								type: 'array', required: true, message: formatMessage({ id: 'Treatments.field_therapists_error' }),
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

const TreatmentsTable = ({ treatments, deleteTreatment, editTreatment, formatMessage }) => {
	const columns = [
		{ title: formatMessage({ id: 'Treatments.field_target' }), dataIndex: 'target', key: 'target' },
		{ title: formatMessage({ id: 'Treatments.field_method' }), dataIndex: 'method', key: 'method' },
		{ title: formatMessage({ id: 'Treatments.field_process' }), dataIndex: 'process', key: 'process' },
		{
			title: formatMessage({ id: 'Treatments.field_patients' }),
			dataIndex: 'patients',
			render: (text, record) =>
				<span>{ record.patients.map(user => `${user.first_name} ${user.last_name}`).join(', ') }</span>
		},
		{
			title: formatMessage({ id: 'Treatments.field_therapists' }),
			dataIndex: 'therapists',
			render: (text, record) =>
				<span>{ record.therapists.map(user => `${user.first_name} ${user.last_name}`).join(', ') }</span>
		},
		{
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			render: (text, record) => (
				<span>
		      <a onClick={ editTreatment(record) }>{formatMessage({ id: 'common.action_edit' })}</a>
					<span className="ant-divider"></span>
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deleteTreatment(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })}
		                  cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <a>{formatMessage({ id: 'common.action_delete' })}</a>
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

	static contextTypes = {
		intl: PropTypes.object.isRequired
	};

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
		const formatMessage = this.context.intl.formatMessage;
		const errorHandler = e => {
			this.setState({ modalLoading: false });
			console.error(e);
			let id = 'common.server_error';
			notification.error({
				message: formatMessage({ id })
			});
		};
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			isEditing ?
				this.props.editSeries({ id: this.state.activeSeries.id, ...values }).then(() => {
					form.resetFields();
					this.setState({ seriesModalOpened: false, modalLoading: false, activeSeries: {} });
				}).catch(errorHandler) :
				this.props.addSeries({ clinic_id: this.props.currentClinic.id, ...values }).then(() => {
					form.resetFields();
					this.setState({ seriesModalOpened: false, modalLoading: false });
				}).catch(errorHandler);

		});
	};

	handleTreatmentSubmit = () => {
		const form = this.treatmentForm;
		const isEditing = !!Object.keys(this.state.activeTreatment).length;
		const formatMessage = this.context.intl.formatMessage;
		const errorHandler = e => {
			this.setState({ modalLoading: false });
			console.error(e);
			let id = 'common.server_error';
			notification.error({
				message: formatMessage({ id })
			});
		};
		form.validateFields((err, values) => {
			if (err) {
				return;
			}
			this.setState({ modalLoading: true });
			isEditing ?
				this.props.editTreatment({ id: this.state.activeTreatment.id, treatment: values }).then(() => {
					form.resetFields();
					this.setState({ treatmentModalOpened: false, modalLoading: false, activeTreatment: {} });
				}).catch(errorHandler) :
				this.props.addTreatment({ series_id: this.state.activeSeries.id, treatment: values }).then(() => {
					form.resetFields();
					this.setState({ treatmentModalOpened: false, modalLoading: false, activeSeries: {} });
				}).catch(errorHandler);

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
		const {
			data: { loading, treatmentSeries = [], patients = [], therapists = [] },
			deleteTreatment, currentClinic
		} = this.props;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			dataIndex: 'name'
		}, {
			title: formatMessage({ id: 'Treatments.field_treatments_number' }),
			key: 'treatments_number',
			dataIndex: 'treatments_number'
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			render: (text, record) => (
				<span>
		      <Button size="small" type='primary' onClick={ this.showTreatmentModal(record) }>
			      <Icon type="plus-circle-o"/>
			      {formatMessage({ id: 'Treatments.create_treatment_button' })}
		      </Button>
					<span className="ant-divider"></span>
		      <Button size="small" type='ghost' onClick={ this.editSeries(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider"></span>
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deleteTreatment(record)
		      } } okText={formatMessage({ id: 'common.confirm_yes' })}
		                  cancelText={formatMessage({ id: 'common.confirm_no' })}>
		        <Button size="small" type='ghost'>
			        {formatMessage({ id: 'common.action_delete' })}
		        </Button>
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
					formatMessage={formatMessage}
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
					formatMessage={formatMessage}
				/>
				<div className="Dashboard__Details">
					<h1 className="Dashboard__Header">
						{ formatMessage({ id: 'Treatments.header' }) }
					</h1>
					<div className="Dashboard__Actions">
						<CheckAccess role={ ROLES.SYSTEM_ADMIN }>
							<ClinicsSelector/>
						</CheckAccess>
						<Button type="primary" onClick={ this.showSeriesModal } disabled={ !currentClinic.id }>
							<Icon type="plus-circle-o"/>
							{ formatMessage({ id: 'Treatments.create_series_button' }) }
						</Button>
					</div>
				</div>
				<Table
					expandedRowRender={record => <TreatmentsTable treatments={record.treatments}
					                                              editTreatment={this.editTreatment}
					                                              formatMessage={formatMessage}
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
				clinic_id: currentClinic.id
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