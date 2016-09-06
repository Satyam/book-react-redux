import React from 'react';
import { Route } from 'react-router';

import App from './app';
import NotFound from './notFound';

import projects from './projects';

export default path => (
  <Route path={path} component={App}>
    {projects('projects')}
    <Route path="*" component={NotFound} />
  </Route>
);
