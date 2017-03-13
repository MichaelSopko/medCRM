import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import './Login.scss';
import ROLES from '../../helpers/constants/roles'

@connect(
	false,
	(dispatch) => ({
		setCurrentClinic(clinic) {
			dispatch({
				type: 'SET_CLINIC',
				clinic
			});
		},
		setCurrentUser(user) {
			dispatch({
				type: 'SET_USER',
				user
			});
		}
	}),
)
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
						const { token, currentUser } = resp;
						let url = '/dashboard';
						switch (currentUser.role) {
							case ROLES.SYSTEM_ADMIN:
								url = '/dashboard/clinics';
								break;
							case ROLES.CLINIC_ADMIN:
								url = '/dashboard/therapists';
								break;
							case ROLES.THERAPIST:
								url = '/dashboard/treatments';
								break;
						}
						this.props.setCurrentUser(currentUser);
						this.props.setCurrentClinic({ id: currentUser.clinic_id });
						this.context.currentUser.setToken(resp.token);
						this.context.router.push(url);
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
							validateTrigger: 'onBlur',
							rules: [{ required: true, message: formatMessage({ id: 'Login.field_email_error' }) }],
						})(
							<Input placeholder={ formatMessage({ id: 'Login.field_email' }) }/>
						)}
					</Form.Item>
					<Form.Item>
						{getFieldDecorator('password', {
							validateTrigger: 'onBlur', rules: [{ required: true, message: 'Please input your Password!' }],
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