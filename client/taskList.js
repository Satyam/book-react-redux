import React, { PropTypes } from 'react';
const map = require('lodash/map');

import Task from './task.js';

const TaskList = ({ pid, tasks, onTaskCompletedChange }) => {
  const onCompletedChangeHandler = ev => onTaskCompletedChange(Object.assign(ev, { pid }));
  return (<ul className="task-list">{
    map(tasks, (task, tid) => (
      <Task
        key={tid}
        descr={task.descr}
        completed={task.completed}
        tid={tid}
        onCompletedChange={onCompletedChangeHandler}
      />)
    )
  }</ul>);
};

TaskList.propTypes = {
  pid: PropTypes.string,
  tasks: PropTypes.object,
  onTaskCompletedChange: PropTypes.func,
};

export default TaskList;
