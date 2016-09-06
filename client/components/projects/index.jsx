import React from 'react';
import { Route } from 'react-router';

import ProjectList from './projectList';
import EditProject from './editProject';
import Project from './project';

export default path => (
  <Route path={path} component={ProjectList}>
    <Route path="newProject" component={EditProject} />
    <Route path="editProject/:pid" component={EditProject} />
    <Route path=":pid" component={Project} />
  </Route>
);
