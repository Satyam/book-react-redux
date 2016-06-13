import {
  PROJECT_BY_ID_SUCCESS,
  ADD_TASK_SUCCESS,
  UPDATE_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
} from './actionTypes';

const update = require('react-addons-update');
import omit from 'lodash/omit';
import pick from 'lodash/pick';

export default (state = {}, action) => {
  switch (action.type) {
    case PROJECT_BY_ID_SUCCESS: {
      return action.data.tasks.reduce(
        (tasks, task) => (tasks[task.pid]
          ? tasks
          : update(tasks, { $merge: { [task.tid]: task } })
        ),
        state
      );
    }
    case ADD_TASK_SUCCESS:
      return update(state, { $merge: { [action.data.tid]: action.data } });
    case UPDATE_TASK_SUCCESS:
      return update(state, {
        [action.data.tid]: { $merge: action.data },
      });
    case DELETE_TASK_SUCCESS:
      return update(state, { $apply: tasks => omit(tasks, action.data.tid) });
    default:
      return state;
  }
};
