import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';

if (process.env.NODE_ENV !== 'production') {
  window.Perf = require('react-addons-perf'); // eslint-disable-line global-require
}

const initialStateEl = document.getElementById('initialState');
let initialState = {};
if (initialStateEl) {
  initialState = JSON.parse(initialStateEl.innerHTML);
}
import createStore from './store/createStore';

export const store = createStore(browserHistory, initialState);

const history = syncHistoryWithStore(browserHistory, store);

if (BUNDLE === 'electronClient') {
  browserHistory.replace('/');
}

import routes from './routes';

const dest = document.getElementById('contents');

export default render((
  <Provider store={store}>
    <Router history={history}>
      {routes}
    </Router>
  </Provider>
), dest);

if (BUNDLE === 'client' && process.env.NODE_ENV !== 'production') {
  if (
    !dest ||
    !dest.firstChild ||
    !dest.firstChild.attributes ||
    !dest.firstChild.attributes['data-react-checksum']
  ) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.'); // eslint-disable-line
  }
}
