import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import reduxThunk from 'redux-thunk';

import { projects, tasks } from './projects';

const reducers = combineReducers({
  projects,
  tasks,
  routing: routerReducer,
});

export default (history) => {
  const mw = applyMiddleware(reduxThunk, routerMiddleware(history));
  return createStore(
    reducers,
    process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? compose(mw, window.devToolsExtension())
    : mw
  );
};
