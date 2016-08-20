import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import styles from './loading.css';

export const LoadingComponent = ({ loading }) => (
  <div
    className={classNames(
      'loading',
      styles.loading,
      { hide: !loading }
    )}
  >loading</div>
);

LoadingComponent.propTypes = {
  loading: PropTypes.bool,
};

export const mapStateToProps = state => ({
  loading: !!state.requests.pending,
});

export default connect(
  mapStateToProps
)(LoadingComponent);
