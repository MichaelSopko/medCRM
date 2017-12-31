import React, { Component, PropTypes } from 'react';
import { Form, Input, Button, message } from 'antd';
import { graphql } from 'react-apollo';
import './Signup.scss';
import SvgImage from '../components/SvgImg';

import ADD_USER from '../graphql/UserAddMutation.graphql';

@graphql(ADD_USER)
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
      const { first_name, last_name, email, password } = values;

      if (!err) {
        this.setState({ loading: true });
        try {
          const request = await this.props.mutate({
            variables: {
              name: `${first_name} ${last_name}`,
              login: email,
              password,
              role: 'role',
            },
          });
          this.setState({ loading: false });
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

    const svgFilter = `<svg >
         <image width="650" height="400" xlink:href="http://lorempixel.com/400/200/" filter="url(#blurlayer)" />
    </svg>`;

    return (
      <main className="Signup">
        <SvgImage filterStrength="15" />
        <div className="Signup__WrapUp">
          <div dangerouslySetInnerHTML={{__html: svgFilter}}></div>
          <div className="Signup__Description">
            <div>
              <h1 >{formatMessage({ id: 'Signup.main_title' })}</h1 >
            </div>
            <div >
              <p>{formatMessage({ id: 'Signup.main_info' })}</p>
            </div >
          </div >
          <Form onSubmit={this.handleSubmit} className="Signup__Content">
            <h1 className="Signup__Header" >{formatMessage({ id: 'Signup.form_title' })}</h1 >
            <Form.Item >
              {getFieldDecorator('first_name', {
                validateTrigger: 'onBlur',
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'Signup.field_email_error' }),
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
                  message: formatMessage({ id: 'Signup.field_email_error' }),
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
                  message: 'Please input your Password!',
                }],
              })(
                <Input
                  type="password"
                  placeholder={formatMessage({ id: 'Signup.field_confirm_password' })}
                />,
              )}
            </Form.Item >
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
              <Button
                type="primary"
                size="large"
                htmlType="button"
                className="Signup__Button"
                onClick={this.handleBackToLogin.bind(this)}
              >
                {formatMessage({ id: 'Signup.button_login' })}
              </Button >
            </Form.Item >
          </Form >
        </div >
      </main >
    );
  }
}

const SignupWithForm = Form.create()(Signup);

export default SignupWithForm;
