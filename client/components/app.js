import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import isPlainClick from 'utils/isPlainClick.js';
import styles from './app.css';

export const App = ({ children, pathname, loading, errors, onCloseErrors }) => (
  <div className="app">
    <p className={styles.loading} style={{ display: loading ? 'block' : 'none' }}>loading</p>
    <pre
      className="alert alert-warning alert-dismissible"
      style={{ display: errors.length ? 'block' : 'none' }}
    >
      <button onClick={onCloseErrors} className="close pull-right">
        <span>&times;</span>
      </button>
      {errors.join('\n')}
    </pre>
    <ul className="nav nav-tabs">
      {
        /^\/projects/.test(pathname)
        ? (<li className="active"><a href="#">Projects</a></li>)
        : (<li><Link to="/projects">Projects</Link></li>)
      }
    </ul>
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
