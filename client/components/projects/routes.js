import React from 'react';
import { Route } from 'react-router';

import ProjectList from './projectList';
import Project from './project';

export default (
  <Route path="projects" component={ProjectList}>
    <Route path=":pid" component={Project} />
  </Route>
);
