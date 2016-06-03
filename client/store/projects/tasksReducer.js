import { TASK_COMPLETED_CHANGE } from './actions';
const update = require('react-addons-update');

import data from './data';

export default (state = data.tasks, action) => {
  switch (action.type) {
    case TASK_COMPLETED_CHANGE: {
      return update(
        state,
        {
          [action.tid]: {
            completed: { $set: action.completed },
          },
        }
      );
    }
    default:
      return state;
  }
};
