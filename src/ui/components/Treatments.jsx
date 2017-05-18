import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { graphql, compose, withApollo } from 'react-apollo'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import update from 'react-addons-update'

import GET_TREATMENTS_QUERY from '../graphql/TreatmentsGet.graphql'
import ADD_TREATMENT_MUTATION from '../graphql/TreatmentAddMutation.graphql'
import DELETE_TREATMENT_MUTATION from '../graphql/TreatmentDeleteMutaion.graphql'
import EDIT_TREATMENT_MUTATION from '../graphql/TreatmentEditMutation.graphql'
import ADD_SERIES_MUTATION from '../graphql/TreatmentSeriesAddMutation.graphql'
import DELETE_SERIES_MUTATION from '../graphql/TreatmentSeriesDeleteMutaion.graphql'
import EDIT_SERIES_MUTATION from '../graphql/TreatmentSeriesEditMutation.graphql'

import SERIES_CREATED_SUBSCRIPTION from '../graphql/SeriesCreatedSubscription.graphql'
import SERIES_UPDATED_SUBSCRIPTION from '../graphql/SeriesUpdatedSubscription.graphql'
import SERIES_DELETED_SUBSCRIPTION from '../graphql/SeriesDeletedSubscription.graphql'

import ROLES from '../../helpers/constants/roles'
import moment from 'moment'

import { withCurrentUser } from './helpers/withCurrentUser';

import './Treatments.scss'

import {
	Table, Icon, Button, Modal, Input, Form, Popconfirm, Select, DatePicker, InputNumber, notification,
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
							<Input />,
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
								required: true, message: formatMessage({ id: 'Treatments.field_treatments_number_error' }),
							}],
						})(
							<InputNumber min={1} />,
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	},
);

const TreatmentForm = Form.create()(
	(props) => {
		let { visible, onCancel, onSubmit, form, loading, therapists, values = {}, formatMessage, currentUser, currentClinic } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!values.id;
		const isTherapist = currentUser.role === ROLES.THERAPIST;
		const therapistsValue = isTherapist && !isEditing
			? [currentUser.id.toString()]
			: values.therapists && values.therapists.map(({ id }) => id.toString());

		if (!isEditing) {
			values = {
				...values,
				start_date: moment(new Date()),
				end_date: undefined,
			}
		} else {
			values = {
				...values,
				start_date: moment(values.start_date),
				end_date: moment(values.end_date),
			}
		}

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Treatments.edit_header' : 'Treatments.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       width={800}
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
							<Input />,
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
							<Input />,
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
							<Input />,
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
							<Input type="textarea" rows={3} />,
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
							<Input type="textarea" rows={3} />,
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_start_date' })}
						hasFeedback
					>
						{getFieldDecorator('start_date', {
							initialValue: values.start_date,
							validateTrigger: 'onBlur', rules: [{
								type: 'object', required: true,
							}],
						})(
							<DatePicker
								showTime
								allowClear={false}
								placeholder={formatMessage({ id: 'Treatments.field_start_date' })}
								onChange={(start_date) => {
									form.setFieldsValue({ end_date: moment(start_date).add(currentClinic.treatment_duration, 'minutes') })
								}}
								format="YYYY-MM-DD HH:mm:ss" />,
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_end_date' })}
						hasFeedback
					>
						{getFieldDecorator('end_date', {
							initialValue: values.end_date || moment().add(currentClinic.treatment_duration, 'minutes'),
							validateTrigger: 'onBlur', rules: [{
								type: 'object', required: true,
							}],
						})(
							<DatePicker
								showTime
								disabledDate={(date) => form.getFieldValue('start_date').valueOf() > date }
								placeholder={formatMessage({ id: 'Treatments.field_end_date' })}
								format="YYYY-MM-DD HH:mm:ss" />,
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_therapists' })}
						style={ { display: !isTherapist ? 'none' : 'flex' } }
						hasFeedback
					>
						<div>{ (isEditing ? therapists : [currentUser]).map(user => `${user.first_name} ${user.last_name}`).join(', ') }</div>
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_therapists' })}
						style={ { display: isTherapist ? 'none' : 'flex' } }
						hasFeedback
					>
						{getFieldDecorator('therapist_ids', {
							initialValue: therapistsValue,
							validateTrigger: 'onBlur', rules: [{
								type: 'array', required: true, message: formatMessage({ id: 'Treatments.field_therapists_error' }),
							}],
						})(
							<Select multiple>
								{ therapists.map(({ first_name, last_name, id }) =>
									<Select.Option key={id} value={id.toString()}>
										{first_name} {last_name}
									</Select.Option>) }
							</Select>,
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	},
);

const TreatmentsTable = ({ treatments, deleteTreatment, editTreatment, formatMessage }) => {
	const columns = [
		{
			title: formatMessage({ id: 'Treatments.field_target' }), dataIndex: 'target', key: 'target',
			width: '15%',
			sorter: (a, b) => a.field_target > b.field_target,
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{text}</span>
			</div>,
		},
		{
			title: formatMessage({ id: 'Treatments.field_start_date_header' }), dataIndex: 'start_date', key: 'start_date',
			width: '30%',
			sorter: (a, b) => moment(a.start_date).valueOf() > moment(b.start_date).valueOf(),
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{moment(text).format('ddd, Do MMMM LT')}</span>
			</div>,
		},
/*		{
			title: formatMessage({ id: 'Treatments.field_end_date' }), dataIndex: 'end_date', key: 'end_date',
			width: '15%',
			render: (text, record) => <div className="to-dynamic-container">
				<span className="to-dynamic">{moment(text).format('ddd, Do MMMM LT')}</span>
			</div>,
		},*/
		{
			title: formatMessage({ id: 'Treatments.field_therapists' }),
			dataIndex: 'therapists',
			width: '20%',
			render: (text, record) => <div className="to-dynamic-container">
				<span
					className="to-dynamic">{ record.therapists.map(user => `${user.first_name} ${user.last_name}`).join(', ') }</span>
			</div>,
		},
		{
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '15%',
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
		rowKey='id' />
};

class Treatments extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	};

	static propTypes = {
		data: PropTypes.object,
	};

	state = {
		seriesModalOpened: false,
		treatmentModalOpened: false,
		activeTreatment: {},
		activeSeries: {},
		modalLoading: false,
	};

	subscriptions = null;

	componentWillReceiveProps(nextProps) {
		const { subscribeToMore } = this.props.data;

		if (!this.subscriptions && nextProps.patient) {
			this.subscriptions = [
				subscribeToMore({
					document: SERIES_CREATED_SUBSCRIPTION,
					variables: { patient_id: nextProps.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						const newSeries = subscriptionData.data.treatmentSeriesCreated;
						const newResult = update(previousResult, {
							treatmentSeries: {
								$unshift: [newSeries],
							},
						});
						return newResult;
					},
				}),
				subscribeToMore({
					document: SERIES_UPDATED_SUBSCRIPTION,
					variables: { patient_id: nextProps.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						previousResult.treatmentSeries = previousResult.treatmentSeries.map((series) => {
							if (series.id === subscriptionData.data.treatmentSeriesUpdated.id) {
								return subscriptionData.data.treatmentSeriesUpdated
							} else {
								return series
							}
						})
						return previousResult
					},
				}),
				subscribeToMore({
					document: SERIES_DELETED_SUBSCRIPTION,
					variables: { patient_id: nextProps.patient.id },
					updateQuery: (previousResult, { subscriptionData }) => {
						previousResult = Object.assign({}, previousResult);
						previousResult.treatmentSeries = previousResult.treatmentSeries.filter(series => series.id !== subscriptionData.data.treatmentSeriesDeleted.id)
						return previousResult
					},
				})];
		}
	}

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
			this.seriesForm.resetFields();
			this.treatmentForm.resetFields();
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
				message: formatMessage({ id }),
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
				this.props.addSeries({ patient_id: this.props.patient.id, clinic_id: this.props.currentClinic.id, ...values }).then(() => {
					form.resetFields();
					this.setState({ seriesModalOpened: false, modalLoading: false });
				}).catch(errorHandler);

		});
	};

	handleTreatmentSubmit = () => {
		const form = this.treatmentForm;
		const isEditing = !!Object.keys(this.state.activeTreatment).length;
		console.log(this.state.activeTreatment);
		const formatMessage = this.context.intl.formatMessage;
		const errorHandler = e => {
			this.setState({ modalLoading: false });
			console.error(e);
			let id = 'common.server_error';
			notification.error({
				message: formatMessage({ id }),
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
			activeSeries: entity,
		});
	};

	editTreatment = entity => () => {
		this.treatmentForm.resetFields();
		this.setState({
			treatmentModalOpened: true,
			activeTreatment: entity,
		});
	};

	render() {
		const {
			data: { loading, treatmentSeries = [], therapists = [] },
			deleteTreatment, currentClinic, deleteSeries, currentUser, patient
		} = this.props;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'common.field_name' }),
			key: 'name',
			dataIndex: 'name',
			sorter: (a, b) => a.name > b.name,
			render: text => <div className="to-dynamic-container">
				<span className="to-dynamic">{ text }</span>
			</div>,
			width: '40%',
		}, {
			title: formatMessage({ id: 'Treatments.field_treatments_number' }),
			key: 'treatments_number',
			dataIndex: 'treatments_number',
			sorter: (a, b) => a.treatments_number > b.treatments_number,
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '35%',
			render: (text, record) => (
				<span>
		      <Button size="small" type='primary' disabled={record.treatments_number <= record.treatments.length || patient.archived}
		              onClick={ this.showTreatmentModal(record) }>
			      <Icon type="plus-circle-o" />
			      {formatMessage({ id: 'Treatments.create_treatment_button' })}
		      </Button>
					<span className="ant-divider"></span>
		      <Button size="small" type='ghost' onClick={ this.editSeries(record) }>
			      {formatMessage({ id: 'common.action_edit' })}
		      </Button>
					<span className="ant-divider"></span>
		      <Popconfirm title={formatMessage({ id: 'common.confirm_message' })} onConfirm={ () => {
			      deleteSeries(record)
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
					therapists={therapists}
					formatMessage={formatMessage}
					currentUser={currentUser}
					currentClinic={currentClinic}
				/>
				<div className="Dashboard__Details" style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<div className="Dashboard__Actions">
						<Button type="primary" size='small' onClick={ this.showSeriesModal } disabled={ !currentClinic.id || patient.archived }>
							<Icon type="plus-circle-o" />
							{ formatMessage({ id: 'Treatments.create_series_button' }) }
						</Button>
					</div>
				</div>
				<Table
					expandedRowRender={record => <TreatmentsTable
						treatments={record.treatments}
						editTreatment={this.editTreatment}
						formatMessage={formatMessage}
						deleteTreatment={deleteTreatment} />
					}
					dataSource={treatmentSeries}
					columns={columns}
					loading={loading}
					rowKey='id' />
			</section>
		);
	}
}

const getOptions = name => ({
	props: ({ ownProps, mutate }) => ({
		[name]: (fields) => mutate({
			variables: fields,
			refetchQueries: [/*{
			 query: GET_TREATMENTS_QUERY,
			 variables: {
			 clinic_id: ownProps.currentClinic.id
			 }
			 }*/],
		}),
	}),
});

const TreatmentsWithApollo = withApollo(compose(
	connect(({ currentClinic, currentUser }) => ({ currentClinic, currentUser })),
	graphql(GET_TREATMENTS_QUERY, {
		options: ({ patient, currentClinic }) => ({
			variables: {
				patient_id: patient.id,
				clinic_id: currentClinic.id,
			},
		}),
	}),
	graphql(ADD_SERIES_MUTATION, getOptions('addSeries')),
	graphql(DELETE_SERIES_MUTATION, getOptions('deleteSeries')),
	graphql(EDIT_SERIES_MUTATION, getOptions('editSeries')),

	graphql(ADD_TREATMENT_MUTATION, getOptions('addTreatment')),
	graphql(DELETE_TREATMENT_MUTATION, getOptions('deleteTreatment')),
	graphql(EDIT_TREATMENT_MUTATION, getOptions('editTreatment')),
	// withCurrentUser
)(Treatments));

export default TreatmentsWithApollo;