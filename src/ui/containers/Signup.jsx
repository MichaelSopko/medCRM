/* eslint-disable camelcase,no-unused-vars */
import React, { Component, PropTypes } from 'react';
import { Form, Input, Button, message } from 'antd';
import { graphql } from 'react-apollo';
import './Signup.scss';

import SIGN_UP from '../graphql/SignUp.graphql';

@graphql(SIGN_UP)
class Signup extends Component {

  static contextTypes = {
    router: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    loading: false,
  };

  handleSubmit(ev) {
    ev.preventDefault();
    const formatMessage = this.context.intl.formatMessage;
    this.props.form.validateFields(async (err, values) => {
      const { first_name, last_name, email, password, confirm_password } = values;

      if (!err && password === confirm_password) {
        this.setState({ loading: true });
        try {
          await this.props.mutate({
            variables: {
              first_name,
              last_name,
              email,
              password,
            },
          });
          this.setState({ loading: false });
          this.handleBackToLogin(ev);
        } catch (e) {
          this.setState({ loading: false });
        }
      }
    });
  }

  handleBackToLogin(ev) {
    ev.preventDefault();
    this.context.router.push('/');
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    const formatMessage = this.context.intl.formatMessage;

    return (
      <main className="Signup">
        <div className="Signup__Container">
          <div className="Signup__WrapUp">
            <div className="Signup__Description">
              <div className="Signup__Description__Header">
                <h1 >{formatMessage({ id: 'Signup.main_title' })}</h1 >
              </div>
              <div >
                <p>{formatMessage({ id: 'Signup.main_info' })}</p>
              </div >
            </div >
            <Form onSubmit={this.handleSubmit.bind(this)} className="Signup__Content">
              <h1 className="Signup__Content__Header" >{formatMessage({ id: 'Signup.form_title' })}</h1 >
              <Form.Item >
                {getFieldDecorator('first_name', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'Signup.field_first_name_error' }),
                  }],
                })(
                  <Input
                    placeholder={formatMessage({ id: 'Signup.field_first_name' })}
                  />,
                )}
              </Form.Item >
              <Form.Item >
                {getFieldDecorator('last_name', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'Signup.field_last_name_error' }),
                  }],
                })(
                  <Input
                    placeholder={formatMessage({ id: 'Signup.field_last_name' })}
                  />,
                )}
              </Form.Item >
              <Form.Item >
                {getFieldDecorator('email', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'Signup.field_email_error' }),
                  }],
                })(
                  <Input
                    placeholder={formatMessage({ id: 'Signup.field_email' })}
                  />,
                )}
              </Form.Item >
              <Form.Item >
                {getFieldDecorator('password', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: true,
                    message: 'Please input your Password!',
                  }],
                })(
                  <Input
                    type="password"
                    placeholder={formatMessage({ id: 'Signup.field_password' })}
                  />,
                )}
              </Form.Item >
              <Form.Item >
                {getFieldDecorator('confirm_password', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: true,
                    message: 'Please input your confirmation password!',
                  }],
                })(
                  <Input
                    type="password"
                    placeholder={formatMessage({ id: 'Signup.field_confirm_password' })}
                  />,
                )}
              </Form.Item >
              <div className="Signup__WrapUp__CTA">
                <Form.Item >
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    className="Signup__Button"
                    loading={loading}
                  >
                    {formatMessage({ id: 'Signup.button_registration' })}
                  </Button >
                </Form.Item >
                <Form.Item >
                <span
                  className="Signup__WrapUp__CTA__Login"
                  onClick={this.handleBackToLogin.bind(this)}
                >
                  {formatMessage({ id: 'Signup.button_login' })}
                </span >
                </Form.Item >
              </div>
            </Form >
          </div>
        </div >
      </main >
    );
  }
}

const SignupWithForm = Form.create()(Signup);

export default SignupWithForm;
