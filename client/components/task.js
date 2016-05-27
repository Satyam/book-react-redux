import React, { PropTypes } from 'react';

export const Task = ({ descr, completed, onCompletedChange, pid, tid }) => {
  const onClickHandler = ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    onCompletedChange({
      pid,
      tid,
      completed: !completed,
    });
  };
  return (
    <li
      onClick={onClickHandler}
      className={`task ${completed ? 'completed' : 'pending'}`}
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

export const mapStateToProps = (state, props) => {
  const pid = props.pid;
  const tid = props.tid;
  const task = state.projects[pid].tasks[tid];
  return {
    descr: task.descr,
    completed: task.completed,
  };
};

import { completedChanged } from '../store/actions.js';

export const mapDispatchToProps = (dispatch) => ({
  onCompletedChange: ({ pid, tid, completed }) => dispatch(completedChanged(pid, tid, completed)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Task);
