import React, { Component, PropTypes } from 'react';
import { Table, Button, message, Form, Input, notification, Col } from 'antd';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { FormattedMessage } from 'react-intl';

import PatientObjectForm from '../components/PatientObjectForm';
import PatientObjectView from '../components/PatientObjectView';

import ADD_TREATMENT_SUMMARY_MUTATION from '../graphql/addTreatmentSummary.mutation.graphql';

import './PatientObjectTab.scss';

@graphql(ADD_TREATMENT_SUMMARY_MUTATION, {
	props: ({ ownProps, mutate }) => ({
		addDiagnose: (values) => mutate({
			variables: { input: { patient_id: ownProps.patient.id, ...values } },
		}),
	}),
})
class TreatmentSummaryTab extends Component {

	static contextTypes = {
		intl: PropTypes.object.isRequired,
	}

	state = {
		formOpened: false,
		viewOpened: false,
		selectedItem: {},
	}

	openForm = () => {
		this.setState({ formOpened: true });
	}

	closeForm = () => {
		this.setState({ formOpened: false });
		setTimeout(() => {
			this.form.resetFields();
		}, 500);
	}

	openView = (selectedItem) => {
		this.setState({ viewOpened: true, selectedItem });
	}

	closeView = () => {
		this.setState({ viewOpened: false, selectedItem: {} });
	}


	handleFormSubmit = () => {
		const formatMessage = this.context.intl.formatMessage;
		const form = this.form;

		form.validateFields((err, values) => {
			if (err) {
				return;
			}

			console.log(values);

			this.props.addDiagnose(values).then((res) => {
				this.closeForm();
			}).catch(e => {
				console.error(e);
				notification.error(e);
			});

		});
	};

	renderFormFields = (form) => {
		const formatMessage = this.context.intl.formatMessage;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};

		return (
			<div>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.treatments_length' })}
				>
					{getFieldDecorator('fields.treatments_length', {
						rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.treatment_targets' })}
				>
					{getFieldDecorator('fields.treatment_targets', {
						rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.parents_involment' })}
				>
					{getFieldDecorator('fields.parents_involment', {
						rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.treatments_progress' })}
				>
					{getFieldDecorator('fields.treatments_progress', {
						rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.recommendations' })}
				>
					{getFieldDecorator('fields.recommendations', {
						rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
			</div>
		);
	}

	renderViewFields = (fields) => {
		return fields && (
			<Col style={{margin: 12}}>
				{Object.keys(fields).map(key => fields[key] && (
					 <div style={{marginTop: 12}}>
						<h4>
							<FormattedMessage id={`TreatmentSummaryTab.${key}`} />
						</h4>
						<p>{fields[key]}</p>
					</div>
				))}
			</Col>
		);
	}

	print() {
		window.print();
	}

	render() {
		const { patient, addTreatmentSummary } = this.props;
		const { formOpened, viewOpened, selectedItem } = this.state;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'Treatments.field_datetime' }),
			key: 'date',
			width: '80%',
			sorter: (a, b) => moment(a.date) > moment(b.date),
			render: (text, record) => <span>
				{moment(record.date).format('LLL')}
			</span>,
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '20%',
			render: (text, record) => ( <span>
				<Button size='small' onClick={() => {
					this.openView(record);
				}}>{formatMessage({ id: 'common.action_view' })}</Button>
			</span> ),
		}];

		return (
			<div className='PatientObjectTab'>
				<PatientObjectForm
					ref={ form => {
						this.form = form
					} }
					patient={patient}
					onCancel={this.closeForm}
					title={formatMessage({ id: 'TreatmentSummaryTab.create_title' })}
					visible={formOpened}
					renderFields={this.renderFormFields}
					onSubmit={this.handleFormSubmit} />
				<PatientObjectView
					patient={patient}
					object={selectedItem}
					onCancel={this.closeView}
					visible={viewOpened}
					onOk={this.print}
					renderFields={this.renderViewFields} />
				<div className='PatientObjectTab__Actions'>
					<Button onClick={this.openForm} type='primary'>{formatMessage({ id: 'common.action_create' })}</Button>
				</div>
				<Table dataSource={patient.treatment_summary} columns={columns} rowKey='id' />
			</div>
		);
	}
}
;

export default TreatmentSummaryTab;