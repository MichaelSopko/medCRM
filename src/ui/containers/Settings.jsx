import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox, message, Select, Tabs, notification } from 'antd'
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo'

import './Settings.scss';
import ROLES from '../../helpers/constants/roles'
import GET_CURRENT_USER_QUERY from '../graphql/CurrentUser.graphql'
import UPDATE_THERAPIST_MUTATION from '../graphql/updateTherapist.mutation.gql'

@compose(
	graphql(GET_CURRENT_USER_QUERY),
	graphql(UPDATE_THERAPIST_MUTATION, {
		props: ({ ownProps, mutate }) => ({
			updateCurrentUser: values => mutate({
				variables: { id: ownProps.data.currentUser.id, therapist: values },
				update: (store, { data: { updateTherapist } }) => {
					const data = store.readQuery({ query: GET_CURRENT_USER_QUERY });
					data.currentUser = {
						...data.currentUser,
						...updateTherapist,
					};
					store.writeQuery({ query: GET_CURRENT_USER_QUERY, data });
				},
			}),
		}),
	}),
	Form.create({
		mapPropsToFields: ({ data }) => {
			let values = data && data.currentUser ? Object.assign({}, data.currentUser) : {};
			Object.keys(values).forEach(key => {
				values[key] = { value: values[key] };
			});
			return values;
		},
	}),
)
class Settings extends Component {

	state = {
		loading: false,
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields(async (err, values) => {
			if (err) {
				return;
			}
			this.setState({ loading: true });
			try {
				console.log('Saving... ', values);
				await this.props.updateCurrentUser(values);
				notification.success({
					message: this.context.intl.formatMessage({ id: 'Settings.success_message' }),
				});
			} catch (e) {
				notification.error(e);
			} finally {
				this.setState({ loading: false });
			}
		});
	}

	static contextTypes = {
		router: PropTypes.object.isRequired,
		currentUser: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired,
	};

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;
		const formatMessage = this.context.intl.formatMessage;

		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 4 },
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 8 },
			},
		};
		const tailFormItemLayout = {
			wrapperCol: {
				xs: {
					span: 24,
					offset: 0,
				},
				sm: {
					span: 8,
					offset: 4,
				},
			},
		};

		return (
			<div className='Container'>
				<section className='Settings'>
					<h1 className="Settings__Header">{formatMessage({ id: 'Settings.header' })}</h1>
					<Form onSubmit={this.handleSubmit} className="Settings__Form">
						<Tabs defaultActiveKey='general' animated={false}>
							<Tabs.TabPane tab={formatMessage({ id: 'Settings.tab1' })} key='general'>
								<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_first_name' })}
								>
									{getFieldDecorator('first_name', {
										validateTrigger: 'onBlur',
										rules: [{
											required: true,
											message: formatMessage({ id: 'common.field_first_name_error' }),
										}],
									})(
										<Input/>,
									)}
								</Form.Item>

								<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_last_name' })}
								>
									{getFieldDecorator('last_name', {
										validateTrigger: 'onBlur',
										rules: [{
											required: true,
											message: formatMessage({ id: 'common.field_last_name_error' }),
										}],
									})(
										<Input/>,
									)}
								</Form.Item>

								<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_licence' })}
								>
									{getFieldDecorator('license_number', {
										validateTrigger: 'onBlur',
										rules: [{
											required: true,
											message: formatMessage({ id: 'common.field_licence_error' }),
										}],
									})(
										<Input/>,
									)}
								</Form.Item>

								<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'common.field_phone' })}
								>
									{getFieldDecorator('phone', {
										validateTrigger: 'onBlur',
										rules: [{
											pattern: /^\d{2,9}-?\d{2,9}?-?\d{0,9}$/,
											required: true, message: formatMessage({ id: 'common.field_phone_error' }),
										}],
									})(
										<Input/>,
									)}
								</Form.Item>

								<Form.Item
									{...formItemLayout}
									label={formatMessage({ id: 'Therapists.field_title.name' })}
									hasFeedback
								>
									{getFieldDecorator('title', {
										validateTrigger: 'onBlur', rules: [],
									})(
										<Select>
											<Select.Option value={'value1'}
											               key={'value1'}>{formatMessage({ id: `Therapists.field_title.value1` })}</Select.Option>
											<Select.Option value={'value2'}
											               key={'value2'}>{formatMessage({ id: `Therapists.field_title.value2` })}</Select.Option>
											<Select.Option value={'value3'}
											               key={'value3'}>{formatMessage({ id: `Therapists.field_title.value3` })}</Select.Option>
										</Select>,
									)}
								</Form.Item>
							</Tabs.TabPane>
						</Tabs>


						<Form.Item
							{...tailFormItemLayout}
						>
							<Button type="primary" size="large" htmlType="submit" className="Settings__Button"
							        loading={loading}>
								{formatMessage({ id: 'Settings.save_button' })}
							</Button>
						</Form.Item>
					</Form>
				</section>
			</div>
		);
	}
}

export default Settings;