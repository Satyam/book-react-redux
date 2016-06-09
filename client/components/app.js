import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import isPlainClick from 'utils/isPlainClick.js';

export const App = ({ children, pathname, loading, errors, onCloseErrors }) => (
  <div className="app">
    <p className="loading" style={{ display: loading ? 'block' : 'none' }}>loading</p>
    <pre
      className="errors"
      style={{ display: errors.length ? 'block' : 'none' }}
      onClick={onCloseErrors}
    >
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
  onCloseErrors: React.PropTypes.func,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => ({
  pathname: props.location.pathname,
  loading: !!state.requests.pending,
  errors: state.requests.errors,
});

import { clearHttpErrors } from 'store/actions';

export const mapDispatchToProps = dispatch => ({
  onCloseErrors: ev => isPlainClick(ev) && dispatch(clearHttpErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
