import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import './Login.scss';

class Login extends Component {

	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);
			}
		});
	}

	render() {

		const { getFieldDecorator } = this.props.form;

		return (
			<main className="Login">
				<Form onSubmit={this.handleSubmit} className="Login__Window">
					<h1 className="Login__Header">Authentication</h1>
					<Form.Item>
						{getFieldDecorator('userName', {
							rules: [{ required: true, message: 'Please input your username!' }],
						})(
							<Input addonBefore={<Icon type="user"/>} placeholder="Username"/>
						)}
					</Form.Item>
					<Form.Item>
						{getFieldDecorator('password', {
							rules: [{ required: true, message: 'Please input your Password!' }],
						})(
							<Input addonBefore={<Icon type="lock"/>} type="password" placeholder="Password"/>
						)}
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" className="Login__Button" loading>
							Log in
						</Button>
					</Form.Item>
				</Form>
			</main>
		);
	}
}

const LoginWithForm = Form.create()(Login);

export default connect(
	(state) => ({ reduxCount: state.counter.reduxCount }),
	(dispatch) => ({
		onLogin(value)
		{
			dispatch({
				type: 'LOGIN_REQUEST',
				value: Number(value)
			});
		}
	}),
)(LoginWithForm);