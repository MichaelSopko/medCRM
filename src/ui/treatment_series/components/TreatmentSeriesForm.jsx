import {
	Form,
	Modal,
	Input,
	Switch,
	Select,
	Col,
	Row, InputNumber,
} from 'antd';
import React from 'react';

export const TreatmentSeriesForm = Form.create()(
	(props) => {
		let { visible, onCancel, onSubmit, form, loading, values, formatMessage } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};
		if (!values) values = {};
		const isEditing = !!Object.keys(values).length;
		const checkForConfirm = () => form.isFieldsTouched() ? Modal.confirm({
			title: formatMessage({ id: 'common.modal_save_confirm.title' }),
			onOk: onCancel,
			okText: formatMessage({ id: 'common.modal_save_confirm.ok' }),
			cancelText: formatMessage({ id: 'common.modal_save_confirm.cancel' })
		}) : onCancel();

		return (
			<Modal title={ formatMessage({ id: isEditing ? 'Treatments.edit_header' : 'Treatments.create_header' }) }
			       visible={visible}
			       okText={ formatMessage({ id: isEditing ? 'common.action_edit' : 'common.action_create' }) }
			       onCancel={checkForConfirm}
			       onOk={onSubmit}
			       confirmLoading={loading}>
				<Form>
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'common.field_name' })}
						hasFeedback
					>
						{getFieldDecorator('name', {
							initialValue: values.name,
							validateTrigger: 'onBlur', rules: [],
						})(
							<Input />,
						)}
					</Form.Item> }
					{ <Form.Item
						{...formItemLayout}
						label={formatMessage({ id: 'Treatments.field_treatments_number' })}
						hasFeedback
					>
						{getFieldDecorator('treatments_number', {
							initialValue: values.treatments_number || 1,
							rules: [{
								required: true, message: formatMessage({ id: 'Treatments.field_treatments_number_error' }),
							}],
						})(
							<InputNumber min={1} />,
						)}
					</Form.Item> }
				</Form>
			</Modal>
		);
	},
);
