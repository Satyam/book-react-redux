import {
  TASK_COMPLETED_CHANGE,
  PROJECT_BY_ID_SUCCESS,
} from './actions';
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
    case PROJECT_BY_ID_SUCCESS: {
      return action.data.tasks.reduce(
        (tasks, task) => (tasks[task.pid]
          ? tasks
          : update(tasks, { $merge: { [task.tid]: task } })
        ),
        state
      );
    }
    default:
      return state;
  }
};
