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

import mapPropsToFields from './mapPropsToFields';

const OutsideSourceConsultForm = (props) => {
	const { visible, onCancel, onSubmit, form, loading, isNew, formatMessage, currentUser, values } = props;
	const { getFieldDecorator } = form;
	const formItemLayout = {
		labelCol: { span: 6 },
		wrapperCol: { span: 14 },
	};

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
			title={formatMessage({ id: !isNew ? 'Treatments.outside_source_consult.create_header' : 'Treatments.outside_source_consult.update_header' })}
			visible={visible}
			okText={formatMessage({ id: !isNew ? 'common.action_edit' : 'common.action_create' })}
			onCancel={checkForConfirm}
			onOk={handleSubmit}
			confirmLoading={loading}
			width={800}
		>
			<Form>
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.outside_source_consult.field.consultantRole' })}
					hasFeedback
				>
					{getFieldDecorator('consultantRole', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input />,
					)}
				</Form.Item>}
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.outside_source_consult.field.consultantRole' })}
					hasFeedback
				>
					{getFieldDecorator('date', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<DatePicker showTime format="DD.MM.YYYY HH:mm" />,
					)}
				</Form.Item>}
				{<Form.Item
					{...formItemLayout}
					label={formatMessage({ id: 'Treatments.outside_source_consult.field.meetingSummary' })}
					hasFeedback
				>
					{getFieldDecorator('meetingSummary', {
						validateTrigger: 'onBlur', rules: [],
					})(
						<Input />,
					)}
				</Form.Item>}
			</Form>
		</Modal>
	);
};

export default Form.create({
	mapPropsToFields
})(OutsideSourceConsultForm);
