import {
	Form,
	Modal,
	Input,
	Switch,
	Select,
	Col,
	Row,
	InputNumber,
} from 'antd';
import ROLES from '../../../helpers/constants/roles';
import moment from 'moment';
import React from 'react';

export const TreatmentForm = Form.create()(
	(props) => {
		let { visible, onCancel, onSubmit, form, loading, therapists,
			values, formatMessage, currentUser, currentClinic } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		if (!values) values = {};
		const isEditing = !!values.id;
		const isTherapist = currentUser.role === ROLES.THERAPIST;
		const therapistsValue = isTherapist && !isEditing
			? [currentUser.id]
			: values.therapists && values.therapists.map(({ id }) => id);

		if (!isEditing) {
			values = {
				...values,
				start_date: moment(new Date()),
				end_date: undefined,
			};
		} else {
			values = {
				...values,
				start_date: moment(values.start_date).utc(),
				end_date: moment(values.end_date).utc(),
			};
		}

		const onStartDateChange = () => {
			setTimeout(() => {
				const m = moment(form.getFieldValue('start_date')).add(currentClinic.treatment_duration, 'minutes');
				form.setFieldsValue({ end_date: {
					year: m.year().toString(),
					date: m.date().toString(),
					month: m.month().toString(),
					hours: m.hours().toString(),
					minutes: m.minutes().toString(),
				} });
			}, 1);
		};

		const defaultStartMoment = moment(values.start_date || undefined);
		const defaultEndMoment = moment(values.start_date || undefined).add(currentClinic.treatment_duration, 'minutes');


		const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
			title: formatMessage({ id: 'common.modal_save_confirm.title' }),
			onOk: onCancel,
			okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' })
		}) : onCancel();
		const handleSubmit = (evt) => {
			evt.preventDefault();
			form.validateFields((err, values) => {
				if (!err) {
					onSubmit(form, values);
				}
			});
		};

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Treatments.edit_header' : 'Treatments.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={checkForConfirm}
			       onOk={handleSubmit}
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
							<Input type="textarea" autosize={{ minRows: 2, maxRows: 20 }} />,
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
							<Input type="textarea" autosize={{ minRows: 2, maxRows: 20 }} />,
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
							<Input type="textarea" autosize={{ minRows: 2, maxRows: 20 }} />,
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
							<Input type="textarea" autosize={{ minRows: 2, maxRows: 20 }} rows={3} />,
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
							<Input type="textarea" autosize={{ minRows: 2, maxRows: 20 }} rows={3} />,
						)}
					</Form.Item> }
					{ !isEditing && <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.repeat_weeks' })}
					>
						{getFieldDecorator('repeat_weeks_trigger', {
							initialValue: false,
							validateTrigger: 'onBlur',
							rules: [],
							valuePropName: 'checked'
						})(
							<Switch />,
						)}
						{ form.getFieldValue('repeat_weeks_trigger') && getFieldDecorator('repeat_weeks', {
								initialValue: 1,
								validateTrigger: 'onBlur',
								rules: [],
							})(
								<InputNumber style={{marginLeft: 12}} min={1} />,
							)}
					</Form.Item> }
					{/*<Form.Item
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
					</Form.Item>*/}

					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_start_date' })}
					>
						<Col span={4}>
							{getFieldDecorator('start_date.year', {
								initialValue: defaultStartMoment.year().toString(),
								onChange: onStartDateChange,
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
						<Col span={4} offset={1}>
							{getFieldDecorator('start_date.date', {
								initialValue: defaultStartMoment.date().toString(),
								onChange: onStartDateChange,
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
						<Col span={6} offset={1}>
							{getFieldDecorator('start_date.month', {
								initialValue: defaultStartMoment.month().toString(),
								onChange: onStartDateChange,
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*',
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_month' })}>
									{ new Array(12).fill(12).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={(y - 1).toString()}>{moment.months()[y - 1]}</Select.Option>)
									}).reverse() }
								</Select>,
							)}
						</Col>
						<Col span={3} offset={1}>
							{getFieldDecorator('start_date.hours', {
								initialValue: defaultStartMoment.hours().toString(),
								onChange: onStartDateChange,
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*',
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_hours' })}>
									{ new Array(24).fill(24).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={(y - 1).toString()}>{(y - 1).toString().length === 1 && '0'}{y-1}</Select.Option>)
									}).reverse() }
								</Select>,
							)}
						</Col>
						<Col span={1} style={{textAlign: 'center'}}>:</Col>
						<Col span={3}>
							{getFieldDecorator('start_date.minutes', {
								initialValue: defaultStartMoment.minutes().toString(),
								onChange: onStartDateChange,
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*',
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_minutes' })}>
									{ new Array(60).fill(60).map((_, i) => {
										const y = _ - i;
										const val = (y-1).toString();
										return (<Select.Option key={i} value={val}>{val.length === 1 && '0'}{val}</Select.Option>);
									}).reverse() }
								</Select>,
							)}
						</Col>

					</Form.Item> }


					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_end_date' })}
					>
						<Col span={4}>
							{getFieldDecorator('end_date.year', {
								initialValue: defaultEndMoment.year().toString(),
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
						<Col span={4} offset={1}>
							{getFieldDecorator('end_date.date', {
								initialValue: defaultEndMoment.date().toString(),
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
						<Col span={6} offset={1}>
							{getFieldDecorator('end_date.month', {
								initialValue: defaultEndMoment.month().toString(),
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*',
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_month' })}>
									{ new Array(12).fill(12).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={(y - 1).toString()}>{moment.months()[y - 1]}</Select.Option>)
									}).reverse() }
								</Select>,
							)}
						</Col>
						<Col span={3} offset={1}>
							{getFieldDecorator('end_date.hours', {
								initialValue: defaultEndMoment.hours().toString(),
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*',
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_hours' })}>
									{ new Array(24).fill(24).map((_, i) => {
										const y = _ - i;
										return (<Select.Option key={i} value={(y - 1).toString()}>{(y - 1).toString().length === 1 && '0'}{y-1}</Select.Option>)
									}).reverse() }
								</Select>,
							)}
						</Col>
						<Col span={1} style={{textAlign: 'center'}}>:</Col>
						<Col span={3}>
							{getFieldDecorator('end_date.minutes', {
								initialValue: defaultEndMoment.minutes().toString(),
								validateTrigger: 'onBlur', rules: [{
									required: true, message: '*',
								}],
							})(
								<Select placeholder={formatMessage({ id: 'common.field_minutes' })}>
									{ new Array(60).fill(60).map((_, i) => {
										const y = _ - i;
										const val = (y-1).toString();
										return (<Select.Option key={i} value={val}>{val.length === 1 && '0'}{val}</Select.Option>);
									}).reverse() }
								</Select>,
							)}
						</Col>

					</Form.Item> }

					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_therapists' })}
						style={ { display: !isTherapist ? 'none' : 'flex' } }
						hasFeedback
					>
						<div>{ (isEditing ? values.therapists : [currentUser]).map(user => `${user.first_name} ${user.last_name}`).join(', ') }</div>
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
