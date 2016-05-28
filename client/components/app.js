import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const App = ({ children, location: { pathname } }) => (
  <div className="app">
    <p>{
      /^\/projects/.test(pathname)
      ? 'Projects'
      : (<Link to="/projects">Projects</Link>)
    }</p>
    {children}
  </div>
);

App.propTypes = {
  children: PropTypes.node,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

export default App;
