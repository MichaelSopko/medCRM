import React from 'react'
import classnames from 'classnames'

import NavBar from './NavBar'

export default function App({ children }) {
  return (
    <div>
      <NavBar/>
      <div className="container">
        {children}
      </div>
      <footer></footer>
    </div>
  );
}

App.propTypes = {
  children: React.PropTypes.element,
};
