import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { routerReducer } from 'react-router-redux'
import clinicReducer from './store/reducers/clinic_reducer';
import userReducer from './store/reducers/user_reducer';

const createReduxStore = (initialState, client) => {
  const store = createStore(
    combineReducers({
      currentClinic: clinicReducer,
      currentUser: userReducer,
      apollo: client.reducer(),
      routing: routerReducer
    }),
    initialState, // initial state
    compose(
      applyMiddleware(client.middleware()),
      // If you are using the devToolsExtension, you can add it here also
      (typeof window !== 'undefined' && window.devToolsExtension) ? window.devToolsExtension() : f => f
    )
  );
  return store;
};

export default createReduxStore;
