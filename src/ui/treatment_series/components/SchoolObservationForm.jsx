import {
	Form,
	Modal,
	Input,
	Switch,
	Select,
	Col,
	Row,
	DatePicker,
	Tabs,
} from 'antd';
import React from 'react';
import ROLES from '../../../helpers/constants/roles';
import mapPropsToFields from './mapPropsToFields';

const SchoolObservationForm = (props) => {
	const { visible, onCancel, onSubmit, form, loading, isNew, formatMessage, therapists,
		currentUser, activeKey, onChangeKey, values } = props;
	const { getFieldDecorator } = form;
	const formItemLayout = {
		labelCol: { span: 6 },
		wrapperCol: { span: 14 },
	};

	const isTherapist = currentUser.role === ROLES.THERAPIST;
	const therapistsValue = isTherapist && isNew
		? [currentUser.id]
		: (values && values.therapists ? values.therapists.map(({ id }) => id) : []);

	const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
		title: formatMessage({ id: 'common.modal_save_confirm.title' }),
		onOk: onCancel,
		okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
		cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' }),
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
		<Modal
			title={formatMessage({ id: isNew ? 'Treatments.school_observation.create_header' : 'Treatments.school_observation.update_header' })}
			visible={visible}
			okText={formatMessage({ id: !isNew ? 'common.action_edit' : 'common.action_create' })}
			onCancel={checkForConfirm}
			onOk={handleSubmit}
			confirmLoading={loading}
		>
			<Form>
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.school_observation.field.observationReason' })}
					hasFeedback
				>
					{getFieldDecorator('observationReason', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />,
					)}
				</Form.Item>}
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.school_observation.field.educationEntity' })}
					hasFeedback
				>
					{getFieldDecorator('educationEntity', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input />,
					)}
				</Form.Item>}
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'common.field_date' })}
					hasFeedback
				>
					{getFieldDecorator('date', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<DatePicker />,
					)}
				</Form.Item>}
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.school_observation.field.context' })}
					hasFeedback
				>
					{getFieldDecorator('context', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input />,
					)}
				</Form.Item>}


				<Tabs animated={false}
					  activeKey={activeKey}
					  onChange={onChangeKey}>
					<Tabs.TabPane key={'background'} tab={formatMessage({ id: 'Treatments.school_observation.tab1' })}>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.generalBackground' })}>
							{getFieldDecorator('generalBackground', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.familyBackground' })}>
							{getFieldDecorator('familyBackground', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.medicalBackground' })}>
							{getFieldDecorator('medicalBackground', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.previousDiagnoses' })}>
							{getFieldDecorator('previousDiagnoses', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
					</Tabs.TabPane>
					<Tabs.TabPane key={2} tab={formatMessage({ id: 'Treatments.school_observation.tab2' })}>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.educationalFramework' })}>
							{getFieldDecorator('educationalFramework', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.observationFindings' })}>
							{getFieldDecorator('observationFindings', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
						<Form.Item
							{...formItemLayout}
							hasFeedback
							label={formatMessage({ id: 'Treatments.school_observation.field.observationSummary' })}>
							{getFieldDecorator('observationSummary', { rules: [] })
							(<Input type='textarea' autosize={{ minRows: 2, maxRows: 20 }} />)}
						</Form.Item>
					</Tabs.TabPane>
				</Tabs>

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
};

export default Form.create({
	mapPropsToFields
})(SchoolObservationForm);
