import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import ProjectList from './projectList.js';
import Project from './project.js';

import App from './app.js';
import NotFound from './notFound.js';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="project" component={ProjectList}>
        <Route path=":pid" component={Project} />
      </Route>
      <Route path="*" component={NotFound} />
    </Route>
  </Router>
), document.getElementById('contents'));
