import React from 'react';
import PropTypes from 'prop-types';

import CurrentUserProvider from './CurrentUserProvider';

export default function App({ children }) {
  return (
    <CurrentUserProvider>
      <div>
        {children}
      </div>
    </CurrentUserProvider>
  );
}

App.propTypes = {
  children: PropTypes.element,
};
