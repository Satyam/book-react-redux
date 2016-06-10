import React, { PropTypes } from 'react';
import './taskList.css';
import Task from './task';

export const TaskList = ({ pid, tids }) => (
  <ul className="task-list">{
    tids
    ? tids.map(tid => (
      <Task
        key={tid}
        tid={tid}
        pid={pid}
      />)
    )
    : null
  }</ul>
);

TaskList.propTypes = {
  pid: PropTypes.string,
  tids: PropTypes.arrayOf(PropTypes.string),
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default connect(
  mapStateToProps
)(TaskList);
