import { TASK_COMPLETED_CHANGE } from './actions.js';
const update = require('react-addons-update');
const filter = require('lodash/filter');
const forEach = require('lodash/forEach');

const reducer = (state, action) => {
  switch (action.type) {
    case TASK_COMPLETED_CHANGE: {
      return update(
        state,
        {
          [action.pid]: {
            pending: {
              $apply: pending => (action.completed ? pending - 1 : pending + 1),
            },
            tasks: {
              [action.tid]: {
                completed: { $set: action.completed },
              },
            },
          },
        }
      );
    }
    default:
      return state;
  }
};

import { createStore } from 'redux';
import data from './data.js';

forEach(data, prj => {
  prj.pending = filter(prj.tasks, // eslint-disable-line no-param-reassign
    task => !task.completed
  ).length;
});

export default createStore(reducer, data);
