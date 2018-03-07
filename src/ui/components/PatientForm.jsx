import React from 'react';
import {
	Modal,
	Input,
	Form,
	Row,
	Col,
	Tabs,
	Select,
	Checkbox,
	Radio,
	Tooltip,
} from 'antd';
import moment from 'moment';

import HEALTH_MAINTENANCES from '../../helpers/constants/health_maintenances';
import RELATED_PERSONS from '../../helpers/constants/related_persons';

const TabPane = Tabs.TabPane;

export default Form.create()(
	(props) => {
		const {
			visible, onCancel, onSubmit, form, loading, values = {},
			onUploadFileChange, formatMessage,
		} = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			/*labelCol: { span: 6 },
			wrapperCol: { span: 14 },*/
		};
		const isEditing = !!Object.keys(values).length;
		const normFile = (e) => {
			if (Array.isArray(e)) {
				return e;
			}
			return e && e.fileList;
		};
		const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
			title: formatMessage({ id: 'common.modal_save_confirm.title' }),
			onOk: onCancel,
			okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' }),
		}) : onCancel();

		const hasFirstPerson = form.getFieldValue('related_persons[0].type') !== undefined;
		const formLayout = 'vertical';

		return (
			<Modal
			       visible={visible}
			       okText={formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' })}
			       onCancel={checkForConfirm}
			       onOk={onSubmit}
			       width={960}
			       confirmLoading={loading}>
				<Form layout={formLayout}>
					<div>
						<Tabs
							animated={false}
							type="card"
						>
							<TabPane
								className="PatientView__Tab"
								tab={formatMessage({ id: isEditing ? 'Patients.edit_header' : 'Patients.create_header' })}
								key="details">
								<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_id_number' })}
									hasFeedback
								>
									{getFieldDecorator('id_number', {
										initialValue: values.id_number,
										validateTrigger: 'onBlur', rules: [{
											type: 'regexp',
											pattern: /^\d+$/,
											required: true,
											message: formatMessage({ id: 'common.field_id_number_error' }),
										}],
									})(
										<Input type='number' />,
									)}
								</Form.Item>
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_first_name' })}
									hasFeedback
								>
									{getFieldDecorator('first_name', {
										initialValue: values.first_name,
										validateTrigger: 'onBlur', rules: [{
											required: true, message: formatMessage({ id: 'common.field_first_name_error' }),
										}],
									})(
										<Input />,
									)}
								</Form.Item>}
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_last_name' })}
									hasFeedback
								>
									{getFieldDecorator('last_name', {
										initialValue: values.last_name,
										validateTrigger: 'onBlur', rules: [{
											required: true, message: formatMessage({ id: 'common.field_last_name_error' }),
										}],
									})(
										<Input />,
									)}
								</Form.Item>}
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_phone' })}
									hasFeedback
								>
									{getFieldDecorator('phone', {
										initialValue: values.phone,
										validateTrigger: 'onBlur', rules: [{
											pattern: /^\d{2,9}-?\d{2,9}?-?\d{0,9}$/,
											required: true,
											message: formatMessage({ id: 'common.field_phone_error' }),
										}],
									})(
										<Input />,
									)}
								</Form.Item>}
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'Patients.field_health_maintenance' })}
									hasFeedback
								>
									{getFieldDecorator('health_maintenance', {
										initialValue: values.health_maintenance,
										validateTrigger: 'onBlur', rules: [],
									})(
										<Select>
											{Object.keys(HEALTH_MAINTENANCES).map(key => <Select.Option value={key} key={key}>
												{formatMessage({ id: `health_maintenance.${key}` })}
											</Select.Option>)}
										</Select>,
									)}
								</Form.Item>}
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_remarks' })}
									hasFeedback
								>
									{getFieldDecorator('remarks', {
										initialValue: values.remarks,
									})(
										<Input />,
									)}
								</Form.Item>}
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.gender.field_name' })}
									hasFeedback
								>
									{getFieldDecorator('gender', {
										initialValue: values.gender,
										validateTrigger: 'onBlur', rules: [{
											required: true, message: formatMessage({ id: 'common.gender.field_error' }),
										}],
									})(
										<Radio.Group>
											<Radio value='MALE'>{formatMessage({ id: 'common.gender.MALE' })}</Radio>
											<Radio value='FEMALE'>{formatMessage({ id: 'common.gender.FEMALE' })}</Radio>
										</Radio.Group>,
									)}
								</Form.Item>}
								{<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_birth_date' })}
									hasFeedback
								>
									<Col span={8}>
										{getFieldDecorator('birth_date.year', {
											initialValue: values.birth_date ? moment(values.birth_date).year().toString() : undefined,
											validateTrigger: 'onBlur', rules: [{
												required: true, message: '*',
											}],
										})(
											<Select placeholder={formatMessage({ id: 'common.field_year' })}>
												{new Array(100).fill(new Date().getFullYear()).map((_, i) => {
													const y = _ - i;
													return (<Select.Option key={i} value={y.toString()}>{y}</Select.Option>)
												})}
											</Select>,
										)}
									</Col>
									<Col span={6} offset={1}>
										{getFieldDecorator('birth_date.date', {
											initialValue: values.birth_date ? moment(values.birth_date).date().toString() : undefined,
											validateTrigger: 'onBlur', rules: [{
												required: true, message: '*',
											}],
										})(
											<Select placeholder={formatMessage({ id: 'common.field_day' })}>
												{new Array(31).fill(1).map((_, i) => {
													const y = ++i;
													return (<Select.Option key={y} value={y.toString()}>{y}</Select.Option>)
												})}
											</Select>,
										)}
									</Col>
									<Col span={8} offset={1}>
										{getFieldDecorator('birth_date.month', {
											initialValue: values.birth_date ? moment(values.birth_date).month().toString() : undefined,
											validateTrigger: 'onBlur', rules: [{
												required: true, message: '*',
											}],
										})(
											<Select placeholder={formatMessage({ id: 'common.field_month' })}>
												{new Array(12).fill(12).map((_, i) => {
													const y = _ - i;
													return (<Select.Option key={i} value={(y - 1).toString()}>{moment.months()[y - 1]}</Select.Option>)
												}).reverse()}
											</Select>,
										)}
									</Col>
								</Form.Item>}
							</TabPane>
							{ !isEditing && <TabPane
								className="PatientView__Tab"
								tab={formatMessage({ id: 'Patients.persons' })}
								key="related">
									<Form.Item
										hasFeedback
										label={formatMessage({ id: 'Patients.field_person_type' })}
									>
										{getFieldDecorator(`related_persons[0].type`, {
											validateTrigger: 'onBlur',
											initialValue: values.type,
											rules: [{ message: formatMessage({ id: 'Patients.field_person_type_error' }) }],
										})(
											<Select placeholder={formatMessage({ id: 'Patients.field_person_type' })}>
												{Object.keys(RELATED_PERSONS).map(key => <Select.Option value={key} key={key}>
													{formatMessage({ id: `related_persons.${RELATED_PERSONS[key]}` })}
												</Select.Option>)}
											</Select>,
										)}
									</Form.Item>
									<Form.Item
										hasFeedback
										label={formatMessage({ id: 'common.field_name' })}
									>
										{getFieldDecorator(`related_persons[0].name`, {
											initialValue: values.name,
											validateTrigger: 'onBlur',
											rules: [{ required: hasFirstPerson, message: formatMessage({ id: 'Patients.field_person_name_error' }) }],
											
										})(
											<Input placeholder={formatMessage({ id: 'Patients.field_person_name' })} />,
										)}
									</Form.Item>
									<Form.Item
										hasFeedback
										label={formatMessage({ id: 'common.field_description' })}
									>
										{getFieldDecorator(`related_persons[0].description`, {
											initialValue: values.description,
											validateTrigger: 'onBlur',
											rules: [{ required: hasFirstPerson, message: formatMessage({ id: 'Patients.field_person_description_error' }) }],
											
										})(
											<Input placeholder={formatMessage({ id: 'Patients.field_person_description' })} />,
										)}
									</Form.Item>
									<Form.Item
										hasFeedback
										label={formatMessage({ id: 'common.field_email'})}
									>
										{getFieldDecorator(`related_persons[0].email`, {
											validateTrigger: 'onBlur',
											initialValue: values.email,
											rules: [{ type: 'email', message: formatMessage({ id: 'common.field_email_error' }) }],
										})(
											<Input type='email' placeholder={formatMessage({ id: 'common.field_email' })} />,
										)}
									</Form.Item>
									<Form.Item
										hasFeedback
										label={formatMessage({ id: 'common.field_phone'})}
									>
										{getFieldDecorator('related_persons[0].phone', {
											initialValue: values.phone,
											validateTrigger: 'onBlur', rules: [{
												pattern: /^\d{2,9}-?\d{2,9}?-?\d{0,9}$/,
												message: formatMessage({ id: 'common.field_phone_error' }),
											}],
										})(
											<Input type='text' placeholder={formatMessage({ id: 'common.field_phone' })} />,
										)}
									</Form.Item>
									<Form.Item>
										{getFieldDecorator(`related_persons[0].receive_updates`, {
											validateTrigger: 'onBlur',
											initialValue: values.receive_updates,
											valuePropName: 'checked',
											rules: [],
										})(
											<Checkbox />,
										)}
										<b>{formatMessage({ id: 'Patients.field_receive_updates'})}</b>
									</Form.Item>
							</TabPane> }
						</Tabs>
					</div>
				</Form>
			</Modal>
		);
	},
);
