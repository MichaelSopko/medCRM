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

const StaffMeetingForm = (props) => {
	const { visible, onCancel, onSubmit, form, loading, isNew, formatMessage, therapists, currentUser, values } = props;
	const { getFieldDecorator } = form;
	const formItemLayout = {
		labelCol: { span: 6 },
		wrapperCol: { span: 14 },
	};

	const isTherapist = currentUser.role === ROLES.THERAPIST;
	const therapistsValue = isTherapist && isNew
		? [currentUser.id]
		: (values && values.participants ? values.participants.map(({ id }) => id) : []);

	const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
		title: formatMessage({ id: 'common.modal_save_confirm.title' }),
		onOk: onCancel,
		okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
		cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' }),
	}) : onCancel();

	return (
		<Modal
			title={formatMessage({ id: !isNew ? 'Treatments.staff_meeting.create_header' : 'Treatments.staff_meeting.update_header' })}
			visible={visible}
			okText={formatMessage({ id: !isNew ? 'common.action_edit' : 'common.action_create' })}
			onCancel={checkForConfirm}
			onOk={onSubmit}
			confirmLoading={loading}
			width={800}
		>
			<Form>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.staff_meeting.field.participants' })}
					style={ { display: isTherapist ? 'none' : 'flex' } }
					hasFeedback
				>
					{getFieldDecorator('participant_ids', {
						initialValue: therapistsValue,
						validateTrigger: 'onBlur', rules: [{
							type: 'array', required: true, message: formatMessage({ id: 'Treatments.field_therapists_error' }),
						}],
					})(
						<Select multiple>
							{ therapists.map(({ first_name, last_name, id }) =>
								<Select.Option key={id} value={id}>
									{first_name} {last_name}
								</Select.Option>) }
						</Select>,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'common.field_date' })}
					hasFeedback
				>
					{getFieldDecorator('observationReason', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<DatePicker showTime format="DD.MM.YYYY HH:mm" />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.staff_meeting.field.protocol' })}
					hasFeedback
				>
					{getFieldDecorator('protocol', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
				<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.staff_meeting.field.nextRecommendation' })}
					hasFeedback
				>
					{getFieldDecorator('nextRecommendation', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input type='textarea' />,
					)}
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default Form.create({
	mapPropsToFields: props => ({
		...props.values,
	})
})(StaffMeetingForm);
