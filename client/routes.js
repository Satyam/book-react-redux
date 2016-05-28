import React from 'react';
import { Route } from 'react-router';

import App from './components/app';
import NotFound from './components/notFound';

import projects from 'components/projects/routes';

export default (
  <Route path="/" component={App}>
    {projects}
    <Route path="*" component={NotFound} />
  </Route>
);
