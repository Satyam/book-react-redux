import { TASK_COMPLETED_CHANGE } from './actions';
const update = require('react-addons-update');
const filter = require('lodash/filter');
const forEach = require('lodash/forEach');

import data from './data';

const tasks = data.tasks;
forEach(data.projects, project => {
  project.pending = filter(project.tids, // eslint-disable-line no-param-reassign
    tid => !tasks[tid].completed
  ).length;
});

export default (state = data.projects, action) => {
  switch (action.type) {
    case TASK_COMPLETED_CHANGE: {
      return update(
        state,
        {
          [action.pid]: {
            pending: {
              $apply: pending => (action.completed ? pending - 1 : pending + 1),
            },
          },
        }
      );
    }
    default:
      return state;
  }
};
