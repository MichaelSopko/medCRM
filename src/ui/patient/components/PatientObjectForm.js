import React, { } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Col, Row, DatePicker, Input, Radio, Select } from 'antd';
import moment from 'moment';

import withTherapists from '../../../utils/withTherapists';
import withCurrentUser from '../../../utils/withCurrentUser';

const PatientObjectForm = (props, context) => {
	const formatMessage = context.intl.formatMessage;
	const { patient, visible, onSubmit, onCancel, form, loading, title, therapists, currentUser,
		showHearingTest, activeKey, onChangeKey, renderFields, object } = props;
	const { getFieldDecorator, isFieldsTouched } = form;
	const formItemLayout = {
		/*labelCol: { span: 6 },
		wrapperCol: { span: 14 },*/
	};
	const isEditing = !!Object.keys(object).length;
	
	const bdate = moment(patient.birth_date);
	const diff = moment.duration(isEditing ? +object.patient_age : moment().diff(bdate));
	const age = {
		years: diff.years() || '0',
		months: diff.months() || '0',
		days: diff.days() || '0',
	};

	let selectedFillers = [];
	if (currentUser.role === 'THERAPIST' && !isEditing) {
		selectedFillers.push(currentUser.id.toString());
	}
	if (isEditing) {
		selectedFillers = object.fillers.map(t => t.id === -1 ? t.first_name : t.id.toString());
	}
	const isTherapist = currentUser.role === 'THERAPIST';

	const checkForConfirm = () => isFieldsTouched() ? Modal.confirm({
		title: formatMessage({ id: 'common.modal_save_confirm.title' }),
		onOk: onCancel,
		okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
		cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' })
	}) : onCancel();
	
	const formLayout = 'vertical';

	return (
		<Modal
			title={title}
			visible={visible}
			okText={ isEditing ? formatMessage({ id: 'common.action_edit' }) : formatMessage({ id: 'common.action_create' }) }
			onOk={onSubmit}
			onCancel={checkForConfirm}
			confirmLoading={loading}
		>
			<div>
				<Form className='PatientObjectForm' layout={formLayout}>
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.diagnose_date' })}
						hasFeedback
					>
						{getFieldDecorator('date', {
							initialValue: moment(object.date || new Date),
							validateTrigger: 'onBlur',
							rules: [{
								required: true,
								message: formatMessage({ id: 'common.field_required' }),
							}],
						})(
							<DatePicker showTime />,
						)}
					</Form.Item>
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_therapists' })}
						style={ { display: !isTherapist ? 'none' : 'flex' } }
						hasFeedback
					>
						<div>{ (isEditing ? values.therapists || [] : [currentUser]).map(user => `${user.first_name} ${user.last_name}`).join(', ') }</div>
					</Form.Item> }
					{<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.diagnose_fillers' })}
						style={ { display: isTherapist ? 'none' : 'flex' } }
						hasFeedback
					>
						{getFieldDecorator('fillers_ids', {
							initialValue: selectedFillers,
							validateTrigger: 'onBlur',
							rules: [{
								required: true,
								message: formatMessage({ id: 'common.field_required' }),
							}],
						})(
							<Select mode="tags">
								{therapists.map(trp => (
									<Select.Option
										key={trp.id.toString()}
										value={trp.id.toString()}>
										{trp.first_name} {trp.last_name}
									</Select.Option>
								))}
							</Select>,
						)}
					</Form.Item>}
					<Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.age_in_diagnose' })}>
						<Row className="rtl-to-right">
							<Col span={4}>
								{getFieldDecorator('patient_age.years', {
									initialValue: age.years,
									validateTrigger: 'onBlur',
									rules: [{
										required: true,
										message: formatMessage({ id: 'common.field_required' }),
									}],
								})(
									<Input type='number' />,
								)}
								<span>{formatMessage({ id: 'common.age.years' })}</span>
							</Col>
							<Col span={4} offset={1}>
								{getFieldDecorator('patient_age.months', {
									initialValue: age.months,
									validateTrigger: 'onBlur',
									rules: [{
										required: true,
										message: formatMessage({ id: 'common.field_required' }),
									}],
								})(
									<Input type='number' />,
								)}
								<span>{formatMessage({ id: 'common.age.months' })}</span>
							</Col>
							<Col span={4} offset={1}>
								{getFieldDecorator('patient_age.days', {
									initialValue: age.days,
									validateTrigger: 'onBlur',
									rules: [{
										required: true,
										message: formatMessage({ id: 'common.field_required' }),
									}],
								})(
									<Input type='number' />,
								)}
								<span>{formatMessage({ id: 'common.age.days' })}</span>
							</Col>
						</Row>
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
							initialValue: object.hearing_test_remark,
							rules: [],
						})(
							<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
						)}
					</Form.Item> }
					{ form.getFieldValue('hearing_test_trigger') === 'YES' && <Form.Item
						{...formItemLayout}
						hasFeedback
						label={formatMessage({ id: 'DiagnoseTab.hearing_test_date' })}
					>
						{getFieldDecorator('hearing_test_date', {
							initialValue: moment(object.hearing_test_date || new Date()),
							rules: [],
						})(
							<DatePicker />,
						)}
					</Form.Item> }
					{ renderFields(form, object.fields || {}) }
				</Form>
			</div>
		</Modal>
	);
};

PatientObjectForm.contextTypes = {
	intl: PropTypes.object.isRequired,
};

export default Form.create()(withCurrentUser(withTherapists(PatientObjectForm)));
