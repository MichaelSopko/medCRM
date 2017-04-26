import React, { Component, PropTypes } from 'react';
import { Table, Button, message, Form, Input, notification, Col, Tabs } from 'antd';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { FormattedMessage } from 'react-intl';

import PatientObjectForm from '../components/PatientObjectForm';
import PatientObjectView from '../components/PatientObjectView';

import ADD_DIAGNOSE_MUTATION from '../graphql/addDiagnose.mutation.graphql';

import './PatientObjectTab.scss';

@graphql(ADD_DIAGNOSE_MUTATION, {
	props: ({ ownProps, mutate }) => ({
		addDiagnose: (values) => mutate({
			variables: { input: { patient_id: ownProps.patient.id, ...values } },
		}),
	}),
})
class DiagnoseTab extends Component {

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

		form.validateFields((err, { hearing_test_trigger, ...values }) => {
			if (err) {
				return;
			}

			values.patient_age =  moment.duration(values.patient_age).asMilliseconds();

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
			<Tabs animated={false}>
				<Tabs.TabPane key={1} tab={formatMessage({ id: 'DiagnoseTab.tab1' })}>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.pregnancy_and_birth' })}>
						{getFieldDecorator('fields.pregnancy_and_birth', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.psychomotor_progression' })}>
						{getFieldDecorator('fields.psychomotor_progression', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.language_and_speech_progression' })}>
						{getFieldDecorator('fields.language_and_speech_progression', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.eating_function' })}>
						{getFieldDecorator('fields.eating_function', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.family_background' })}>
						{getFieldDecorator('fields.family_background', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.health_background' })}>
						{getFieldDecorator('fields.health_background', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.past_and_present_treatments' })}>
						{getFieldDecorator('fields.past_and_present_treatments', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.environmental_context' })}>
						{getFieldDecorator('fields.environmental_context', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.parents_report' })}>
						{getFieldDecorator('fields.parents_report', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.kindergarten_teacher_report' })}>
						{getFieldDecorator('fields.kindergarten_teacher_report', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
				</Tabs.TabPane>
				<Tabs.TabPane key={2} tab={formatMessage({ id: 'DiagnoseTab.tab2' })}>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.diagnose_tools' })}>
						{getFieldDecorator('fields.diagnose_tools', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.behaviour_and_general_impression' })}>
						{getFieldDecorator('fields.behaviour_and_general_impression', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.communications_skills' })}>
						{getFieldDecorator('fields.communications_skills', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.gaming_skills' })}>
						{getFieldDecorator('fields.gaming_skills', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.language_grasp' })}>
						{getFieldDecorator('fields.language_grasp', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.language_expression' })}>
						{getFieldDecorator('fields.language_expression', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.speech_intelligibility' })}>
						{getFieldDecorator('fields.speech_intelligibility', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.speech_fluency' })}>
						{getFieldDecorator('fields.speech_fluency', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
				</Tabs.TabPane>
				<Tabs.TabPane key={3} tab={formatMessage({ id: 'DiagnoseTab.tab3' })}>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.summary' })}>
						{getFieldDecorator('fields.summary', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.recommendations' })}>
						{getFieldDecorator('fields.recommendations', { rules: [] })
						(<Input type='textarea' />)}
					</Form.Item>
				</Tabs.TabPane>
			</Tabs>
		);
	}

	renderViewFields = (fields) => {
		return fields && (
				<Col style={{ margin: 12 }}>
					{Object.keys(fields).map((key, i) => fields[key] && (
						<div style={{ marginTop: 12 }}>
							{ i === 0 && <h3>
								<FormattedMessage id={`DiagnoseTab.tab1`} />
							</h3> }
							{ i === 9 && <h3>
								<FormattedMessage id={`DiagnoseTab.tab2`} />
							</h3> }
							{ i === 17 && <h3>
								<FormattedMessage id={`DiagnoseTab.tab3`} />
							</h3> }
							<h4>
								<FormattedMessage id={`DiagnoseTab.${key}`} />
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
			sorter: (a, b) => moment(a.date).valueOf() > moment(b.date).valueOf(),
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
					title={formatMessage({ id: 'DiagnoseTab.create_title' })}
					visible={formOpened}
					showHearingTest
					renderFields={this.renderFormFields}
					onSubmit={this.handleFormSubmit} />
				<PatientObjectView
					patient={patient}
					object={selectedItem}
					onCancel={this.closeView}
					visible={viewOpened}
					onOk={this.print}
					showHearingTest
					renderFields={this.renderViewFields} />
				<div className='PatientObjectTab__Actions'>
					<Button onClick={this.openForm} type='primary'>{formatMessage({ id: 'common.action_create' })}</Button>
				</div>
				<Table dataSource={patient.diagnoses} columns={columns} rowKey='id' />
			</div>
		);
	}
}
;

export default DiagnoseTab;