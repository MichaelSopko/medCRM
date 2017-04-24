import React, { Component, PropTypes } from 'react';
import { Table, Button, message, Form, Input, notification } from 'antd';
import moment from 'moment';
import { graphql } from 'react-apollo';

import PatientObjectForm from '../components/PatientObjectForm';
import PatientObjectView from '../components/PatientObjectView';

import ADD_TREATMENT_SUMMARY_MUTATION from '../graphql/addTreatmentSummary.mutation.graphql';

import './PatientObjectTab.scss';

@graphql(ADD_TREATMENT_SUMMARY_MUTATION, {
	props: ({ ownProps, mutate }) => ({
		addTreatmentSummary: (values) => mutate({
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
		selectedItem: null,
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
		this.setState({ viewOpened: false, selectedItem: null });
	}


	handleFormSubmit = () => {
		const formatMessage = this.context.intl.formatMessage;
		const form = this.form;

		form.validateFields((err, values) => {
			if (err) {
				return;
			}

			console.log(values);

			this.props.addTreatmentSummary(values).then((res) => {
				this.closeForm();
			}).catch(e => {
				console.error(e);
				notification.error(e);
			});

		});
	};

	renderFields = (form) => {
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
					{getFieldDecorator('treatments_length', {
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
					{getFieldDecorator('treatment_targets', {
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
					{getFieldDecorator('parents_involment', {
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
					{getFieldDecorator('treatments_progress', {
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
					{getFieldDecorator('recommendations', {
						rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
			</div>
		);
	}

	render() {
		const { patient, addTreatmentSummary } = this.props;
		const { formOpened, viewOpened, selectedItem } = this.state;
		const formatMessage = this.context.intl.formatMessage;

		const columns = [{
			title: formatMessage({ id: 'Treatments.field_datetime' }),
			key: 'name',
			width: '80%',
			sorter: (a, b) => moment(a.date) > moment(b.date),
			render: (text, record) => <span>
				{moment(text).format('LLL')}
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
					onClose={this.closeForm}
					title={formatMessage({ id: 'TreatmentSummaryTab.create_title' })}
					visible={formOpened}
					renderFields={this.renderFields}
					onSubmit={this.handleFormSubmit}
					showHearingTest />
				<PatientObjectView />
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