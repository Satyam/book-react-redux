import React, { PropTypes } from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

export const ProjectItem = ({ pid, name }) => (
  <li className="project-item">
    <Link to={`project/${pid}`}>
      {name}
    </Link>
  </li>
);

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const ProjectList = () => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<ProjectItem key={pid} pid={pid} name={data[pid].name} />)
      )
    }</ul>
  </div>
);

export default ProjectList;
