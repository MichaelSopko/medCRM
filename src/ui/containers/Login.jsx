import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import './Login.scss';
import ROLES from '../../helpers/constants/roles';

@connect(
  false,
  dispatch => ({
    setCurrentClinic(clinic) {
      dispatch({
        type: 'SET_CLINIC',
        clinic,
      });
    },
    setCurrentUser(user) {
      dispatch({
        type: 'SET_USER',
        user,
      });
    },
  }),
)
class Login extends Component {

  static contextTypes = {
    router: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    loading: false,
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const formatMessage = this.context.intl.formatMessage;
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({ loading: true });
        console.log('Received values of form: ', values);
        try {
          const resp = await fetch('/api/authentication', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
            },
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
                url = '/dashboard/patients';
                break;
            }
            this.props.setCurrentUser(currentUser);
            this.props.setCurrentClinic({ id: currentUser.clinic_id });
            this.context.currentUser.setToken(resp.token);
            this.context.router.push(url);
          } else if (resp.error === 'WRONG_PASSWORD') {
            message.error(formatMessage({ id: 'Login.error_password' }));
          } else if (resp.error === 'USER_DISABLED') {
            message.error(formatMessage({ id: 'Login.error_disabled' }));
          } else {
            message.error(formatMessage({ id: 'common.server_error' }));
          }
        } catch (exc) {
          console.log(exc);
          this.setState({ loading: false });
        }
      }
    });
  };

  handleGoToRegistration(ev) {
    ev.preventDefault();
    this.context.router.push('/signup');
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    const formatMessage = this.context.intl.formatMessage;

    return (
      <main className="Login" >
        <Form onSubmit={this.handleSubmit} className="Login__Window" >
          <h1 className="Login__Header" >{formatMessage({ id: 'Login.header' })}</h1 >
          <Form.Item >
            {getFieldDecorator('login', {
              validateTrigger: 'onBlur',
              rules: [{ required: true, message: formatMessage({ id: 'Login.field_email_error' }) }],
            })(
              <Input placeholder={formatMessage({ id: 'Login.field_email' })} />,
            )}
          </Form.Item >
          <Form.Item >
            {getFieldDecorator('password', {
              validateTrigger: 'onBlur', rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input type="password" placeholder={formatMessage({ id: 'Login.field_password' })} />,
            )}
          </Form.Item >
          <div className="Login__Window__CTA">
            <div className="Login__Window__CTA__Registration">
              <div>
                <span
                  className="Login__Window__CTA__Registration--Register"
                  onClick={this.handleGoToRegistration.bind(this)}
                >
                 Registration
                </span>
              </div>
            </div>
            <Form.Item >
              <Button type="primary" size="large" htmlType="submit" className="Login__Button" loading={loading} >
                {formatMessage({ id: 'Login.login_button' })}
              </Button >
            </Form.Item >
          </div>
        </Form >
      </main >
    );
  }
}

const LoginWithForm = Form.create()(Login);

export default LoginWithForm;
