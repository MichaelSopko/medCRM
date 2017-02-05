import React from 'react'
import classnames from 'classnames'
import CurrentUserProvider from './CurrentUserProvider'

import NavBar from './NavBar'

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
  children: React.PropTypes.element,
};
