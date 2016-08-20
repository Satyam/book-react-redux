import React from 'react';
import { Route } from 'react-router';

import App from '_components/app';
import NotFound from '_components/notFound';

import projects from '_components/projects';

export default (
  <Route path="/" component={App}>
    {projects}
    <Route path="*" component={NotFound} />
  </Route>
);
