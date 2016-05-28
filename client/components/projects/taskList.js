import React, { PropTypes } from 'react';
const map = require('lodash/map');

import Task from './task';

const TaskList = ({ pid, tasks }) => (
  <ul className="task-list">{
    map(tasks, (task, tid) => (
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

export default TaskList;
