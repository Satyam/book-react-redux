import React, { PropTypes } from 'react';
const data = require('./data.js');

export const Task = ({ descr, complete }) => (
  <li>
    <input type="checkbox" defaultChecked={complete} /> &nbsp; {descr}
  </li>
);

Task.propTypes = {
  complete: PropTypes.bool,
  descr: PropTypes.string,
};

export const TaskList = ({ tasks }) => (
  <ul className="task-list">{
    Object.keys(tasks).map(tid => (
      <Task key={tid} complete={tasks[tid].complete} descr={tasks[tid].descr} />
    ))
  }</ul>
);

TaskList.propTypes = {
  tasks: PropTypes.object,
};

const Project = ({ params: { pid } }) => {
  const prj = data[pid];
  return (<div className="project">
    <h1>{prj.name}</h1>
    <p>{prj.descr}</p>
    <TaskList tasks={prj.tasks} />
  </div>);
};

Project.propTypes = {
  params: PropTypes.shape({
    pid: PropTypes.string.isRequired,
  }),
};

export default Project;
