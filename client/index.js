import React, { PropTypes } from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

export const PrjItem = ({ pid, name }) => (
  <li className="prj-item">
    <Link to={`project/${pid}`}>
      {name}
    </Link>
  </li>
);

PrjItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const ProjectList = () => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<PrjItem key={pid} pid={pid} name={data[pid].name} />)
      )
    }</ul>
  </div>
);

export default ProjectList;
