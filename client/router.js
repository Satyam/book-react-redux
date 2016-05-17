import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory  } from 'react-router';

const Index = require('./index.js');
const Project = require('./project.js');

const App = (props) => props.children;

const routeConfig = {
  path: '/',
  component: App,
  indexRoute: { component: Index },
  childRoutes: [
    { path: 'index', component: Index },
    { path: 'project/:pid', component: Project }
  ]
};

render(
  React.createElement(
    Router,
    {
      routes: routeConfig,
      history: browserHistory
    }
  ),
  document.getElementById('contents')
);
