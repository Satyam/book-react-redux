import React, { PropTypes } from 'react';

import Task from './task.js';

export const TaskList = ({ pid, tasks }) => (
  <ul className="task-list">{
    Object.keys(tasks).map(tid => (
      <Task
        key={tid}
        tid={tid}
        pid={pid}
      />)
    )
  }</ul>
);

TaskList.propTypes = {
  pid: PropTypes.string,
  tasks: PropTypes.object,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default connect(
  mapStateToProps
)(TaskList);
