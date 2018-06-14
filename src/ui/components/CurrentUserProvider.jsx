/* eslint-disable consistent-return */
import React, { Component } from 'react'
import { withApollo, graphql } from 'react-apollo'
import GET_CURRENT_USER_QUERY from '../graphql/CurrentUser.graphql'
import { connect } from 'react-redux';
import Cookie from 'js-cookie';
import PropTypes from 'prop-types';

import CLINIC_UPDATED_SUBSCRIPTION from '../graphql/ClinicUpdatedSubscription.graphql'

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
    const { subscribeToMore } = this.props.data;
    
    if (newProps.data.error) {
      this.logout();
      return false;
    }
    if (currentUser) {
      console.log(currentUser);
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
        if (!newProps.data.loading && currentUser.id && (!this.subscriptions || !currentUser)
        ) {
            this.subscriptions = [
                subscribeToMore({
                    document: CLINIC_UPDATED_SUBSCRIPTION,
                    variables: { id: currentUser.clinic.id },
                    updateQuery: (previousResult, { subscriptionData }) => {
                        const newClinicData = subscriptionData.data.clinicUpdated;
                        if (newClinicData.disabled) {
                          this.logout();
                        }
                        
                        return true;
                    },
                }),];
        }
    }
  }

  setToken(token) {
    localStorage.setItem('token', token);
    Cookie.set('token', token, { expires: 365 });
    this.props.data.refetch();
  }

  logout() {
    localStorage.removeItem('token');
    Cookie.remove('token');
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
