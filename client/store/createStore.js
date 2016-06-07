import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import reduxThunk from 'redux-thunk';
import remoteRequests from './requests/middleware';

import { projects, tasks } from './projects';
import requests from './requests';

const reducers = combineReducers({
  projects,
  tasks,
  requests,
  routing: routerReducer,
});

export default (history) => {
  const mw = applyMiddleware(reduxThunk, remoteRequests, routerMiddleware(history));
  return createStore(
    reducers,
    process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? compose(mw, window.devToolsExtension())
    : mw
  );
};
