import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';

import projects from './projects';

const reducers = combineReducers({
  projects,
  routing: routerReducer,
});

export default (history) => {
  const mw = applyMiddleware(routerMiddleware(history));
  return createStore(
    reducers,
    process.env.NODE_ENV !== 'production' && window.devToolsExtension
    ? compose(mw, window.devToolsExtension())
    : mw
  );
};
