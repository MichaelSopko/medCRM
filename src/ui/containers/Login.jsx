import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import './Login.scss';

class Login extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired
	}

	state = {
		loading: false
	}

	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields(async(err, values) => {
			if (!err) {
				this.setState({ loading: true });
				console.log('Received values of form: ', values);
				try {
					const resp = await fetch('/api/authentication', {
						method: "POST",
						body: JSON.stringify(values),
						headers: {
							"Content-Type": "application/json"
						}
					}).then(r => r.json());

					if (resp.token) {
						localStorage.setItem('token', resp.token);
						this.context.router.push('/dashboard/clinics');
					}
				} catch (e) {
					console.log(e);
				} finally {
					this.setState({ loading: false });
				}
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;

		return (
			<main className="Login">
				<Form onSubmit={this.handleSubmit} className="Login__Window">
					<h1 className="Login__Header">Authentication</h1>
					<Form.Item>
						{getFieldDecorator('login', {
							rules: [{ required: true, message: 'Please input your login!' }],
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
						<Button type="primary" size="large" htmlType="submit" className="Login__Button" loading={loading}>
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