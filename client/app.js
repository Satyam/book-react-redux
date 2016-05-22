import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const App = props => (
  <div className="app">
    <p><Link to="/project">Projects</Link></p>
    {props.children}
  </div>
);

App.propTypes = {
  children: PropTypes.node,
};

export default App;
