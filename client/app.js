import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const App = ({ children, location: { pathname } }) => (
  <div className="app">
    <p>{
      /^\/project/.test(pathname)
      ? 'Projects'
      : (<Link to="/project">Projects</Link>)
    }</p>
    {children}
  </div>
);

App.propTypes = {
  children: PropTypes.node,
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string,
  }),
};

export default App;
