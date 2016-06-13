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
      <span
        onClick={onClickHandler}
        className={classNames(
          'col-xs-9',
          { [styles.completed]: completed },
          styles.descr
        )}
      >
        {descr}
      </span>
      <span
        className={classNames(
          'col-xs-3',
          styles.icons
        )}
      >
        <span
          className="glyphicon glyphicon-pencil text-primary"
          onClick={onTaskEditHandler}
          aria-hidden="true"
        ></span>
        <span
          className="glyphicon glyphicon-trash text-danger"
          onClick={onTaskDeleteHandler}
          aria-hidden="true"
        ></span>
      </span>
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

export const mapStateToProps = (state, props) => state.tasks[props.tid];

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
