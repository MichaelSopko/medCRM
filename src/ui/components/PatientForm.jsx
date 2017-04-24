import React, { Component, PropTypes } from 'react'
import {
	Table,
	Icon,
	Button,
	Modal,
	Input,
	Form,
	Row,
	Col,
	Popconfirm,
	Select,
	DatePicker,
	Upload,
	notification,
	Checkbox,
	Radio
} from 'antd'
import moment from 'moment';


import HEALTH_MAINTENANCES from '../../helpers/constants/health_maintenances'
import RELATED_PERSONS from '../../helpers/constants/related_persons'

export default Form.create()(
	(props) => {
		const {
			visible, onCancel, onSubmit, form, loading, values = {},
			onUploadFileChange, addRelatedPerson, removeRelatedPerson,
			relatedPersons, formatMessage,
		} = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		const isEditing = !!Object.keys(values).length;
		const normFile = (e) => {
			if (Array.isArray(e)) {
				return e;
			}
			return e && e.fileList;
		};

		let relatedPersonsItems = relatedPersons.map(item => (
			<div className="Patients__RelatedPersonsItem ant-form" key={item._id}>
				<Button
					title={formatMessage({ id: 'common.action_delete' })}
					shape='circle'
					type="ghost"
					className='Patients__RelatedPersonsRemove'
					size="small"
					onClick={ () => {
						removeRelatedPerson(item._id)
					} }>
					<Icon type="close" />
				</Button>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${item._id}-type`, {
						initialValue: item.type,
						validateTrigger: 'onBlur',
						rules: [{ required: true, message: formatMessage({ id: 'Patients.field_person_type_error' }) }],
					})(
						<Select placeholder={formatMessage({ id: 'Patients.field_person_type' })}>
							{ Object.keys(RELATED_PERSONS).map(key => <Select.Option value={key} key={key}>
								{formatMessage({ id: `related_persons.${RELATED_PERSONS[key]}` })}
							</Select.Option>) }
						</Select>,
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${item._id}-description`, {
						initialValue: item.description,
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input placeholder={formatMessage({ id: 'Patients.field_person_description' })} />,
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${item._id}-phone`, {
						initialValue: item.phone,
						validateTrigger: 'onBlur',
						rules: [{ required: true, message: formatMessage({ id: 'common.field_phone_error' }) }],
					})(
						<Input type="number" placeholder={formatMessage({ id: 'common.field_phone' })} />,
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${item._id}-email`, {
						initialValue: item.email,
						validateTrigger: 'onBlur',
						rules: [{ type: 'email', message: formatMessage({ id: 'common.field_email_error' }) }],
					})(
						<Input type="email" placeholder={formatMessage({ id: 'common.field_email' })} />,
					)}
				</Form.Item>
				<Form.Item
					hasFeedback
				>
					{getFieldDecorator(`related_persons-${item._id}-receive_updates`, {
						initialValue: item.receive_updates,
						validateTrigger: 'onBlur',
						valuePropName: 'checked',
						rules: [],
					})(
						<Checkbox>
							{formatMessage({ id: 'Patients.field_receive_updates' })}
						</Checkbox>,
					)}
				</Form.Item>
			</div>));

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Patients.edit_header' : 'Patients.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={onCancel}
			       onOk={onSubmit}
			       width={600}
			       confirmLoading={loading}>
				<Form>
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
							<Input type="number" />,
						)}
					</Form.Item>
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_email' })}
						hasFeedback
					>
						{getFieldDecorator('profile_email', {
							initialValue: values.profile_email,
							validateTrigger: 'onBlur', rules: [{
								type: 'email', message: formatMessage({ id: 'common.field_email_error' }),
							}],
						})(
							<Input type="email" />,
						)}
					</Form.Item> }
					{ <Form.Item
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
					</Form.Item> }
					{ <Form.Item
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
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_phone' })}
						hasFeedback
					>
						{getFieldDecorator('phone', {
							initialValue: values.phone,
							validateTrigger: 'onBlur', rules: [{
								pattern: /^\d{2,9}-?\d{2,9}?-?\d{0,9}$/,
								required: true, message: formatMessage({ id: 'common.field_phone_error' }),
							}],
						})(
							<Input />,
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.field_health_maintenance' })}
						hasFeedback
					>
						{getFieldDecorator('health_maintenance', {
							initialValue: values.health_maintenance,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Select>
								{ Object.keys(HEALTH_MAINTENANCES).map(key => <Select.Option value={key} key={key}>
									{HEALTH_MAINTENANCES[key]}
								</Select.Option>) }
							</Select>,
						)}
					</Form.Item> }
					{ <Form.Item
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
					</Form.Item> }
					{ <Form.Item
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
									{ new Array(100).fill(new Date().getFullYear()).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={y.toString()}>{y}</Select.Option>)
									}) }
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
									{ new Array(31).fill(1).map((_, i) => {
										const y = ++i;
										return (<Select.Option key={y} value={y.toString()}>{y}</Select.Option>)
									}) }
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
									{ new Array(12).fill(12).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={(y - 1).toString()}>{moment.months()[y - 1]}</Select.Option>)
									}) }
								</Select>,
							)}
						</Col>

					</Form.Item> }

					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Patients.field_related_persons' })}
						hasFeedback
					>
						{ relatedPersonsItems }
						<Button type="dashed" onClick={ addRelatedPerson }>
							{formatMessage({ id: 'Patients.add_related_persons' })}
						</Button>
					</Form.Item> }
				</Form>
			</Modal>
		);
	},
);