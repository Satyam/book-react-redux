import React, { PropTypes } from 'react';
const data = require('./data.js');

import TaskList from './taskList.js';

const Project = ({ params: { pid } }) => {
  const onTaskCompletedChangeHandler = ev => {
    data[ev.pid].tasks[ev.tid].completed = ev.completed;
  };
  const prj = data[pid];
  return (<div className="project">
    <h1>{prj.name}</h1>
    <p>{prj.descr}</p>
    <TaskList
      pid={pid}
      tasks={prj.tasks}
      onTaskCompletedChange={onTaskCompletedChangeHandler}
    />
  </div>);
};

Project.propTypes = {
  params: PropTypes.shape({
    pid: PropTypes.string.isRequired,
  }),
};

export default Project;
