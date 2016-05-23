import React, { PropTypes } from 'react';
import store from './store.js';

import TaskList from './taskList.js';

const Project = ({ params: { pid } }) => {
  const prj = store.getState()[pid];
  return prj
  ? (
    <div className="project">
      <h1>{prj.name}</h1>
      <p>{prj.descr}</p>
      <TaskList
        pid={pid}
        tasks={prj.tasks}
      />
    </div>)
  : (<p>Project {pid} not found</p>);
};

Project.propTypes = {
  params: PropTypes.shape({
    pid: PropTypes.string.isRequired,
  }),
};

export default Project;
