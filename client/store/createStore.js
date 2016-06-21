import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import reduxThunk from 'redux-thunk';

import { projects, tasks } from './projects';
import requests from './requests';
import misc from './misc';

const reducers = combineReducers({
  projects,
  tasks,
  requests,
  misc,
  routing: routerReducer,
});

import remoteRequests from './requests/middleware';

export default (history, initialState) => {
  const mw = applyMiddleware(reduxThunk, remoteRequests, routerMiddleware(history));
  return createStore(
    reducers,
    initialState,
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    window.devToolsExtension
    ? compose(mw, window.devToolsExtension())
    : mw
  );
};
