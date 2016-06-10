import React, { PropTypes } from 'react';
import isPlainClick from 'utils/isPlainClick.js';
import styles from './task.css';
import classNames from 'classnames';

export const Task = ({ descr, completed, onCompletedChange, pid, tid }) => {
  const onClickHandler = ev => isPlainClick(ev) && onCompletedChange({
    pid,
    tid,
    completed: !completed,
  });
  return (
    <li
      onClick={onClickHandler}
      className={classNames(
        'task',
        { [styles.completed]: completed },
        styles.task
      )}
    >
      {descr}
    </li>
  );
};

Task.propTypes = {
  descr: PropTypes.string,
  completed: PropTypes.bool,
  onCompletedChange: PropTypes.func,
  pid: PropTypes.string,
  tid: PropTypes.string,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.tasks[props.tid];

import { completedChanged } from 'store/actions';

export const mapDispatchToProps = (dispatch) => ({
  onCompletedChange: ({ pid, tid, completed }) => dispatch(completedChanged(pid, tid, completed)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
