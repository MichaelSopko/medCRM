import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Col, Row, DatePicker, Input, Icon, Button, Switch, Radio, Select } from 'antd';
import moment from 'moment';

import withTherapists from '../../../utils/withTherapists';
import withCurrentUser from '../../../utils/withCurrentUser';

const PatientObjectForm = (props, context) => {
	const formatMessage = context.intl.formatMessage;
	const { patient, visible, onSubmit, onCancel, form, loading, title, therapists, currentUser, showHearingTest, renderFields } = props;
	const { getFieldDecorator } = form;
	const formItemLayout = {
		labelCol: { span: 6 },
		wrapperCol: { span: 14 },
	};

	return (
		<Modal title={title}
		       visible={visible}
		       okText={ formatMessage({ id: 'common.action_create' }) }
		       onOk={onSubmit}
		       onCancel={onCancel}
		       width={1000}
		       confirmLoading={loading}>
			<Form className='PatientObjectForm'>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Patients.diagnose_date' })}
					hasFeedback
				>
					{getFieldDecorator('date', {
						initialValue: moment(),
						validateTrigger: 'onBlur',
						rules: [{
							required: true,
						}],
					})(
						<DatePicker showTime />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Patients.diagnose_fillers' })}
					hasFeedback
				>
					{getFieldDecorator('fillers_ids', {
						initialValue: currentUser.role === 'THERAPIST' ? [currentUser.id.toString()] : [],
						validateTrigger: 'onBlur',
						rules: [{
							required: true,
						}],
					})(
						<Select multiple>
							{therapists.map(trp => (
								<Select.Option
									key={trp.id.toString()}
									value={trp.id.toString()}>
									{trp.first_name} {trp.last_name}
								</Select.Option>
							))}
						</Select>,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Patients.age_in_diagnose' })}
					hasFeedback
				>
					{getFieldDecorator('patient_age', { // TODO: select age
						initialValue: '',
						validateTrigger: 'onBlur',
						rules: [{
							required: true,
						}],
					})(
						<Input />,
					)}
				</Form.Item>
				{ showHearingTest && <Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'DiagnoseTab.hearing_test' })}
					hasFeedback
				>
					{getFieldDecorator('hearing_test_trigger', {
						initialValue: 'YES',
						rules: [],
					})(
						<Radio.Group>
							<Radio value='YES'>{formatMessage({ id: 'common.confirm_yes' })}</Radio>
							<Radio value='NO'>{formatMessage({ id: 'common.confirm_no' })}</Radio>
						</Radio.Group>,
					)}
				</Form.Item> }
				{ form.getFieldValue('hearing_test_trigger') === 'YES' && <Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'DiagnoseTab.hearing_test_remarks' })}
				>
					{getFieldDecorator('hearing_test_remark', {
						rules: [],
					})(
						<Input type='textarea' />
					)}
				</Form.Item> }
				{ form.getFieldValue('hearing_test_trigger') === 'YES' && <Form.Item
					{...formItemLayout}
					hasFeedback
					label={formatMessage({ id: 'DiagnoseTab.hearing_test_date' })}
				>
					{getFieldDecorator('hearing_test_date', {
						initialValue: moment(),
						rules: [],
					})(
						<DatePicker />
					)}
				</Form.Item> }
				{ renderFields(form) }
			</Form>
		</Modal>
	);
};

PatientObjectForm.contextTypes = {
	intl: PropTypes.object.isRequired,
}

export default Form.create()(withCurrentUser(withTherapists(PatientObjectForm)));