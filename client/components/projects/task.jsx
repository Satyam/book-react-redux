import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import isPlainClick from '_utils/isPlainClick';
import classNames from 'classnames';

import { completedChanged, setEditTid, deleteTask } from '_store/actions';
import styles from './task.css';

export const TaskComponent = (
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
        />
        <span
          className={styles.deleteIcon}
          onClick={onTaskDeleteHandler}
        />
      </div>
    </div>
  );
};

TaskComponent.propTypes = {
  pid: PropTypes.string,
  tid: PropTypes.string,
  descr: PropTypes.string,
  completed: PropTypes.bool,
  onCompletedChange: PropTypes.func,
  onTaskEdit: PropTypes.func,
  onTaskDelete: PropTypes.func,
};

export const mapStateToProps = (state, props) => state.tasks[props.tid] || {
  descr: '',
  completed: false,
};


export const mapDispatchToProps = (dispatch) => ({
  onCompletedChange:
    ({ pid, tid, descr, completed }) => dispatch(completedChanged(pid, tid, descr, completed)),
  onTaskEdit: ({ tid }) => dispatch(setEditTid(tid)),
  onTaskDelete: ({ pid, tid, completed }) => dispatch(deleteTask(pid, tid, completed)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskComponent);
