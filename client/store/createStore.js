import { combineReducers, createStore } from 'redux';

import projects from './projects';

const reducers = combineReducers({
  projects,
});

export default () => createStore(
  reducers,
  process.env.NODE_ENV !== 'production' && window.devToolsExtension
  ? window.devToolsExtension()
  : undefined
);
