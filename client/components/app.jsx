import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import isPlainClick from '_utils/isPlainClick';
import classNames from 'classnames';
import { clearHttpErrors } from '_store/actions';
import styles from './app.css';

export const AppComponent = ({ children, pathname, loading, errors, onCloseErrors }) => (
  <div className="app">
    <div
      className={classNames(
        styles.loading,
        { hide: !loading }
      )}
    >loading</div>
    <div
      className={classNames(
        styles.errorsList,
        { hide: !errors.length }
      )}
    >
      <button onClick={onCloseErrors} className={styles.closeButton} />
      {errors.join('\n')}
    </div>
    <ul className={styles.tabs}>
      {
        /^\/projects/.test(pathname)
        ? (<li className={styles.active}><a href="#Projects">Projects</a></li>)
        : (<li><Link to="/projects">Projects</Link></li>)
      }
    </ul>
    {children}
  </div>
);

AppComponent.propTypes = {
  children: PropTypes.node,
  pathname: PropTypes.string,
  loading: PropTypes.bool,
  errors: PropTypes.array,
  onCloseErrors: PropTypes.func,
};

export const mapStateToProps = (state, props) => ({
  pathname: props.location.pathname,
  loading: !!state.requests.pending,
  errors: state.requests.errors,
});

export const mapDispatchToProps = dispatch => ({
  onCloseErrors: ev => isPlainClick(ev) && dispatch(clearHttpErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppComponent);
