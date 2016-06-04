import { TASK_COMPLETED_CHANGE } from './actions';
const update = require('react-addons-update');

export default (state = {}, action) => {
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
