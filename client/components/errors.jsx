import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import isPlainClick from '_utils/isPlainClick';
import classNames from 'classnames';
import { clearHttpErrors } from '_store/actions';
import styles from './errors.css';

export const ErrorsComponent = ({ errors, onCloseErrors }) => (
  <div
    className={classNames(
      'errors',
      styles.errorsList,
      { hide: !errors.length }
    )}
  >
    <button onClick={onCloseErrors} className={styles.closeButton} />
    {errors.join('\n')}
  </div>
);

ErrorsComponent.propTypes = {
  errors: PropTypes.array,
  onCloseErrors: PropTypes.func,
};

export const mapStateToProps = state => ({
  errors: state.requests.errors,
});

export const mapDispatchToProps = dispatch => ({
  onCloseErrors: ev => isPlainClick(ev) && dispatch(clearHttpErrors()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorsComponent);
