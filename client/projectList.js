import React, { PropTypes } from 'react';
import { Link } from 'react-router';
const data = require('./data.js');
const map = require('lodash/map');
const filter = require('lodash/filter');

export const ProjectItem = ({ pid, name, active, pending }) => (
  <li className={`project-item ${active ? 'selected' : ''}`}>
    {
     active
     ? name
     : (<Link to={`/project/${pid}`}>{name}</Link>)
   } [Pending: {pending}]
  </li>
);

ProjectItem.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  pending: React.PropTypes.number.isRequired,
};

const ProjectList = ({ children, params }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      map(data, (prj, pid) =>
        (<ProjectItem
          key={pid}
          pid={pid}
          name={prj.name}
          active={params.pid === pid}
          pending={
            filter(prj.tasks,
              task => !task.completed
            ).length
          }
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
