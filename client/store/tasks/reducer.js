import update from 'react-addons-update';
import omit from 'lodash/omit';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  PROJECT_BY_ID,
  DELETE_PROJECT,
} from '_store/projects/actions';

import {
  ADD_TASK,
  UPDATE_TASK,
  DELETE_TASK,
} from './actions';

export default (state = {}, action) => {
  if (action.error || (action.meta && action.meta.asyncAction !== REPLY_RECEIVED)) return state;
  const payload = action.payload;
  switch (action.type) {
    case PROJECT_BY_ID:
      return update(state, { $merge: payload.tasks.reduce(
        (newTasks, task) => (
          task.tid in state
          ? newTasks
          : Object.assign(newTasks, { [task.tid]: task })
        ),
        {}
      ) });
    case DELETE_PROJECT:
      return Object.keys(state).reduce(
        (newState, tid) => Object.assign(
          newState,
          state[tid].pid === payload.pid
          ? null
          : { [tid]: state[tid] }
        ),
        {}
      );
    case ADD_TASK:
      return update(state, { $merge: { [payload.tid]: payload } });
    case UPDATE_TASK:
      return update(state, {
        [payload.tid]: { $merge: payload },
      });
    case DELETE_TASK:
      return update(state, { $apply: tasks => omit(tasks, payload.tid) });
    default:
      return state;
  }
};
