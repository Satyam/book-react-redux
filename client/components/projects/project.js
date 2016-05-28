import React, { PropTypes } from 'react';
import TaskList from './taskList';

export const Project = ({ pid, name, descr }) => (
  name
  ? (
    <div className="project">
      <h1>{name}</h1>
      <p>{descr}</p>
      <TaskList
        pid={pid}
      />
    </div>)
  : (<p>Project {pid} not found</p>)
);

Project.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string,
  descr: PropTypes.string,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  const project = state.projects[pid];
  return {
    pid,
    name: project && project.name,
    descr: project && project.descr,
  };
};

export default connect(
  mapStateToProps
)(Project);
