import { TASK_COMPLETED_CHANGE } from './actions';
const update = require('react-addons-update');

export default (state = {}, action) => {
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
