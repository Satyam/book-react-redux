import React from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

const ProjectItem = ({ pid, name }) => (
  <li className="project-item">
    <Link to={`project/${pid}`}>
      {name}
    </Link>
  </li>
);

ProjectItem.propTypes = {
  pid: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
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
