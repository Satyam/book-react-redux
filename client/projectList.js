import React, { PropTypes } from 'react';
import store from './store.js';
const map = require('lodash/map');

import ProjectItem from './projectItem.js';

const ProjectList = ({ children, params }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      map(store.getState(), (prj, pid) =>
        (<ProjectItem
          key={pid}
          pid={pid}
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
