import React from 'react';
import { Route } from 'react-router';

import ProjectList from './components/projectList.js';
import Project from './components/project.js';

import App from './components/app.js';
import NotFound from './components/notFound.js';


export default (
  <Route path="/" component={App}>
    <Route path="project" component={ProjectList}>
      <Route path=":pid" component={Project} />
    </Route>
    <Route path="*" component={NotFound} />
  </Route>
);
