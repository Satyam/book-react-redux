import React, { PropTypes } from 'react';
import { store } from 'store';

const map = require('lodash/map');

import ProjectItem from './projectItem';

const ProjectList = ({ children, params }) => (
  <div className="project-list">
    <h1>Projects:</h1>
    <ul>{
      map(store.getState().projects, (prj, pid) =>
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
  params: PropTypes.shape({
    pid: PropTypes.string,
  }),
};

export default ProjectList;
