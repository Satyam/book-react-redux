import React, { PropTypes } from 'react';
import { Link } from 'react-router';
const data = require('./data.js');

export const ProjectItem = ({ pid, name, active }) => (
  <li className={`project-item ${active ? 'selected' : ''}`}>
    {
     active
     ? name
     : (<Link to={`/project/${pid}`}>{name}</Link>)
   }
  </li>
);

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

const ProjectList = ({ children, params }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      Object.keys(data).map(pid =>
        (<ProjectItem
          key={pid}
          pid={pid}
          name={data[pid].name}
          active={params.pid === pid}
        />)
      )
    }</ul>
    {children}
  </div>
);

ProjectList.propTypes = {
  children: PropTypes.node,
  params: React.PropTypes.shape({
    pid: React.PropTypes.string,
  }),
};

export default ProjectList;
