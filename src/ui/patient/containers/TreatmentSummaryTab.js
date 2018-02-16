import React, { Component, } from 'react'; import PropTypes from 'prop-types';
import { Table, Button, message, Form, Input, notification, Col } from 'antd';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import PatientObjectForm from '../components/PatientObjectForm';

import ADD_TREATMENT_SUMMARY_MUTATION from '../graphql/addTreatmentSummary.mutation.graphql';
import EDIT_TREATMENT_SUMMARY_MUTATION from '../graphql/editTreatmentSummary.mutation.graphql';

import './PatientObjectTab.scss';

@graphql(ADD_TREATMENT_SUMMARY_MUTATION, {
	props: ({ ownProps, mutate }) => ({
		addDiagnose: (values) => mutate({
			variables: { input: { patient_id: ownProps.patient.id, ...values } },
		}),
	}),
})
@graphql(EDIT_TREATMENT_SUMMARY_MUTATION, {
	props: ({ ownProps, mutate }) => ({
		editDiagnose: (id, values) => mutate({
			variables: { id, input: { patient_id: ownProps.patient.id, ...values } },
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

	openEditForm = (selectedItem) => {
		this.setState({ formOpened: true, selectedItem });
	}

	openForm = () => {
		this.setState({ formOpened: true });
	}

	closeForm = () => {
		this.setState({ formOpened: false, selectedItem: {} });
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
			const isEditing = !!Object.keys(this.state.selectedItem).length;

			values.patient_age = moment.duration(values.patient_age).asMilliseconds();

			console.log(values);

			(!isEditing ? this.props.addDiagnose(values) : this.props.editDiagnose(this.state.selectedItem.id, values))
				.then((res) => {
					this.closeForm();
				}).catch(e => {
				console.error(e);
				notification.error(e);
			});

		});
	};

	renderFormFields = (form, object) => {
		const formatMessage = this.context.intl.formatMessage;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		console.log(object);

		return (
			<div className="PatientObjectTab">
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.treatments_length' })}
				>
					{getFieldDecorator('fields.treatments_length', {
						initialValue: object.treatments_length,
						rules: [],
					})(
						<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.treatment_targets' })}
				>
					{getFieldDecorator('fields.treatment_targets', {
						initialValue: object.treatment_targets,
						rules: [],
					})(
						<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.parents_involment' })}
				>
					{getFieldDecorator('fields.parents_involment', {
						initialValue: object.parents_involment,
						rules: [],
					})(
						<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.treatments_progress' })}
				>
					{getFieldDecorator('fields.treatments_progress', {
						initialValue: object.treatments_progress,
						rules: [],
					})(
						<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'TreatmentSummaryTab.recommendations' })}
				>
					{getFieldDecorator('fields.recommendations', {
						initialValue: object.recommendations,
						rules: [],
					})(
						<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
					)}
				</Form.Item>
			</div>
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
			sorter: (a, b) => moment(a.date).valueOf() > moment(b.date).valueOf(),
			render: (text, record) => <span>
				{moment(record.date).format('LLL')}
			</span>,
		}, {
			title: formatMessage({ id: 'common.field_actions' }),
			key: 'action',
			width: '20%',
			render: (text, record) => ( <span>
{/*				<Link to={`/print-object/${patient.id}/${record.id}`} target='_blank'>
					<Button size='small'>{formatMessage({ id: 'common.action_print' })}</Button>
				</Link>
				<Link to={`/api/generate-pdf/${patient.id}/${record.id}`} target='_blank'>
					<Button size='small'>PDF</Button>
				</Link>*/}
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
					object={selectedItem}
					onSubmit={this.handleFormSubmit} />
				<div className='PatientObjectTab__Actions'>
					<Button onClick={this.openForm} type='primary'>{formatMessage({ id: 'TreatmentSummaryTab.create_title' })}</Button>
				</div>
				<Table
					onRowClick={(record, index, event) => {
						// dont edit when button clicked
						if(event.target.tagName === 'BUTTON' || event.target.tagName === 'A'  || event.target.parentNode.tagName === 'BUTTON') {
							return;
						}
						this.openEditForm(record);
					}} dataSource={patient.treatment_summary} columns={columns} rowKey='id' />
			</div>
		);
	}
}
;

export default TreatmentSummaryTab;
