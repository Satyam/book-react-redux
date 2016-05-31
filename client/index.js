import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf'); // eslint-disable-line global-require
}

import createStore from './store/createStore';

export const store = createStore();

const history = syncHistoryWithStore(browserHistory, store);

import routes from './routes';

const dest = document.getElementById('contents');

export default render((
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>
), dest);
