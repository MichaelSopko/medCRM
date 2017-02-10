import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import './Login.scss';

class Login extends Component {

	static contextTypes = {
		router: PropTypes.object.isRequired,
		currentUser: PropTypes.object.isRequired,
		intl: PropTypes.object.isRequired
	};

	state = {
		loading: false
	};

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

					this.setState({ loading: false });
					if (resp.token) {
						this.context.currentUser.setToken(resp.token);
						this.context.router.push('/dashboard');
					}
				} catch (e) {
					console.log(e);
					this.setState({ loading: false });
				}
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;
		const formatMessage = this.context.intl.formatMessage;

		return (
			<main className="Login">
				<Form onSubmit={this.handleSubmit} className="Login__Window">
					<h1 className="Login__Header">{ formatMessage({ id: 'Login.header' }) }</h1>
					<Form.Item>
						{getFieldDecorator('login', {
							rules: [{ required: true, message: formatMessage({ id: 'Login.field_email_error' }) }],
						})(
							<Input placeholder={ formatMessage({ id: 'Login.field_email' }) }/>
						)}
					</Form.Item>
					<Form.Item>
						{getFieldDecorator('password', {
							rules: [{ required: true, message: 'Please input your Password!' }],
						})(
							<Input type="password" placeholder={ formatMessage({ id: 'Login.field_password' }) }/>
						)}
					</Form.Item>
					<Form.Item>
						<Button type="primary" size="large" htmlType="submit" className="Login__Button" loading={loading}>
							{ formatMessage({ id: 'Login.login_button' }) }
						</Button>
					</Form.Item>
				</Form>
			</main>
		);
	}
}

const LoginWithForm = Form.create()(Login);

export default LoginWithForm;