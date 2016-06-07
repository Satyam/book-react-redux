import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const App = ({ children, pathname, loading, errors }) => (
  <div className="app">
    <p className="loading" style={{ display: loading ? 'block' : 'none' }}>loading</p>
    <pre className="errors" style={{ display: errors.length ? 'block' : 'none' }}>
      {errors.join('\n')}
    </pre>
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
  pathname: PropTypes.string,
  loading: PropTypes.bool,
  errors: PropTypes.array,
};

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => ({
  pathname: props.location.pathname,
  loading: !!state.requests.pending,
  errors: state.requests.errors,
});

export default connect(
  mapStateToProps
)(App);
