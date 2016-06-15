import React, { PropTypes } from 'react';
import isPlainClick from 'utils/isPlainClick.js';
import styles from './task.css';
import classNames from 'classnames';

export const Task = (
  { pid, tid, descr, completed, onCompletedChange, onTaskEdit, onTaskDelete }
) => {
  const onClickHandler = ev => isPlainClick(ev) && onCompletedChange({
    pid,
    tid,
    descr,
    completed: !completed,
  });
  const onTaskEditHandler = ev => isPlainClick(ev) && onTaskEdit({ pid, tid });
  const onTaskDeleteHandler = ev => {
    if (
      isPlainClick(ev) &&
      window.confirm(`Delete: \n${descr}\nAre you sure?`)  // eslint-disable-line no-alert
    ) {
      onTaskDelete({ pid, tid, completed });
    }
  };
  return (
    <div
      className={classNames(
        'row',
        'task',
        styles.task
      )}
    >
      <div
        onClick={onClickHandler}
        className={classNames(
          'col-xs-9',
          { [styles.completed]: completed },
          styles.descr
        )}
      >
        {descr}
      </div>
      <div
        className={classNames(
          'col-xs-3',
          styles.icons
        )}
      >
        <span
          className={styles.editIcon}
          onClick={onTaskEditHandler}
        ></span>
        <span
          className={styles.deleteIcon}
          onClick={onTaskDeleteHandler}
        ></span>
      </div>
    </div>
  );
};

Task.propTypes = {
  pid: PropTypes.string,
  tid: PropTypes.string,
  descr: PropTypes.string,
  completed: PropTypes.bool,
  onCompletedChange: PropTypes.func,
  onTaskEdit: PropTypes.func,
  onTaskDelete: PropTypes.func,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.tasks[props.tid] || {
  descr: '',
  completed: false,
};

import { completedChanged, setEditTid, deleteTask } from 'store/actions';

export const mapDispatchToProps = (dispatch) => ({
  onCompletedChange:
    ({ pid, tid, descr, completed }) => dispatch(completedChanged(pid, tid, descr, completed)),
  onTaskEdit: ({ tid }) => dispatch(setEditTid(tid)),
  onTaskDelete: ({ pid, tid, completed }) => dispatch(deleteTask(pid, tid, completed)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
