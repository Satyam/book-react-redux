import React, { PropTypes } from 'react';
const data = require('./data.js');

export const Task = ({ descr, completed, tid, onClick }) => {
  const handler = ev => {
    if (ev.button || ev.shiftKey || ev.altKey || ev.metaKey || ev.ctrlKey) return;
    ev.preventDefault();
    onClick({ tid });
  };
  return (<li onClick={handler} className={`task ${completed ? 'completed' : 'pending'}`}>
    {descr}
  </li>);
};

Task.propTypes = {
  completed: PropTypes.bool,
  descr: PropTypes.string,
  tid: PropTypes.string,
  onClick: PropTypes.func,
};

export const TaskList = ({ pid, tasks }) => {
  const handler = ev => console.log('click', Object.assign(ev, { pid }));
  return (<ul className="task-list">{
    Object.keys(tasks).map(tid => {
      const task = tasks[tid];
      return (<Task
        key={tid}
        descr={task.descr}
        completed={task.completed}
        tid={tid}
        onClick={handler}
      />);
    })
  }</ul>);
};

TaskList.propTypes = {
  pid: PropTypes.string,
  tasks: PropTypes.object,
};

const Project = ({ params: { pid } }) => {
  const prj = data[pid];
  return (<div className="project">
    <h1>{prj.name}</h1>
    <p>{prj.descr}</p>
    <TaskList pid={pid} tasks={prj.tasks} />
  </div>);
};

Project.propTypes = {
  params: PropTypes.shape({
    pid: PropTypes.string.isRequired,
  }),
};

export default Project;
