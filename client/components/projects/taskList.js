import React, { PropTypes } from 'react';
import Task from './task';

export const TaskList = ({ pid, tids }) => (
  <ul className="task-list">{
    tids.map(tid => (
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
  tids: PropTypes.arrayOf(PropTypes.string),
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => state.projects[props.pid];

export default connect(
  mapStateToProps
)(TaskList);
