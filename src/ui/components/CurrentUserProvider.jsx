/* eslint-disable consistent-return */
import React, { PropTypes, Component } from 'react';
import { withApollo, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import GET_CURRENT_USER_QUERY from '../graphql/CurrentUser.graphql';


@graphql(GET_CURRENT_USER_QUERY)
@withApollo
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
export default class CurrentUserProvider extends Component {

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    data: PropTypes.object,
  };

  static childContextTypes = {
    currentUser: PropTypes.object,
  };

  getChildContext() {
    return {
      currentUser: {
        logout: ::this.logout,
        setToken: ::this.setToken,
      },
    };
  }

  componentWillReceiveProps(newProps) {
    const { data: { loading = false, currentUser = null, error = null } } = newProps;

    if (newProps.data.error) {
      this.logout();
      return false;
    }
    if (currentUser) {
      this.props.setCurrentUser({
        ...currentUser,
        loading: false,
      });
    }
    if (!currentUser && loading) {
      this.props.setCurrentUser({ loading });
    }
    if (currentUser && currentUser.clinic) {
      this.props.setCurrentClinic(currentUser.clinic);
    }
  }

  setToken(token) {
    localStorage.setItem('token', token);
    this.props.data.refetch();
  }

  logout() {
    localStorage.removeItem('token');
    const pathName = this.context.router.location.pathname;

    if (pathName !== '/login' && pathName !== '/signup') {
      this.context.router.push('/login');
      this.props.data.refetch();
      this.props.setCurrentClinic(null);
      this.props.setCurrentUser(null);
    }
  }

  render() {
    return this.props.children;
  }

}
