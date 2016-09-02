import update from 'react-addons-update';

import omit from 'lodash/omit';
import without from 'lodash/without';

import {
  REPLY_RECEIVED,
} from '_store/requests/actions';

import {
  TASK_COMPLETED_CHANGE,
  ALL_PROJECTS,
  PROJECT_BY_ID,
  ADD_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  ADD_TASK,
  DELETE_TASK,
} from './actions';

export default (state = {}, action) => {
  if (action.error) {
    if (action.type === PROJECT_BY_ID) {
      const pid = action.meta.originalPayload.pid;
      return update(state, { $merge: {
        [pid]: {
          pid,
          error: 404,
        },
      } });
    }
    return state;
  } else if (action.meta && action.meta.asyncAction !== REPLY_RECEIVED) return state;
  const payload = action.payload;
  switch (action.type) {
    case TASK_COMPLETED_CHANGE: {
      return update(state,
        {
          [action.pid]: {
            pending: {
              $apply: pending => (action.completed ? pending - 1 : pending + 1),
            },
          },
        }
      );
    }
    case ALL_PROJECTS:
      return update(state, { $merge: payload.reduce(
        (projects, project) => (
          project.pid in state
          ? projects
          : Object.assign(projects, { [project.pid]: project })
        ),
        {}
      ) });
    case PROJECT_BY_ID: {
      const project = payload;
      return update(state,
          state[project.pid]
            ? {
              [project.pid]: {
                $merge: {
                  descr: project.descr,
                  tids: project.tasks.map(task => task.tid),
                },
              },
            }
            : {
              $merge: {
                [project.pid]: {
                  pid: project.pid,
                  name: project.name,
                  descr: project.descr,
                  tids: project.tasks.map(task => task.tid),
                },
              },
            }
        );
    }
    case ADD_PROJECT:
      return update(state,
        { $merge: { [payload.pid]: Object.assign({ pending: 0 }, payload) } }
      );
    case UPDATE_PROJECT:
      return update(state, { [payload.pid]: { $merge: payload } });
    case DELETE_PROJECT:
      return omit(state, payload.pid);
    case ADD_TASK:
      return update(state,
        { [payload.pid]: {
          tids: { $push: [payload.tid] },
          pending: { $apply: pending => pending + 1 },
        } }
      );
    case DELETE_TASK:
      return update(state,
        { [payload.pid]: {
          tids: { $apply: tids => without(tids, payload.tid) },
          pending: { $apply: pending => pending - (payload.completed ? 0 : 1) },
        } }
      );
    default:
      return state;
  }
};
