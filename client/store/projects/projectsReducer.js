import {
  TASK_COMPLETED_CHANGE,
  ALL_PROJECTS_SUCCESS,
  PROJECT_BY_ID_SUCCESS,
  ADD_PROJECT_SUCCESS,
  UPDATE_PROJECT_SUCCESS,
  DELETE_PROJECT_SUCCESS,
  ADD_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
} from './actionTypes';

const update = require('react-addons-update');
import omit from 'lodash/omit';
import without from 'lodash/without';

export default (state = {}, action) => {
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
    case ALL_PROJECTS_SUCCESS:
      return update(state, { $merge: action.data.reduce(
        (projects, project) => {
          if (!(project.pid in state)) {
            projects[project.pid] = project; // eslint-disable-line no-param-reassign
          }
          return projects;
        },
        {}
      ) });
    case PROJECT_BY_ID_SUCCESS: {
      const project = action.data;
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
    case ADD_PROJECT_SUCCESS:
      return update(state,
        { $merge: { [action.data.pid]: Object.assign({ pending: 0 }, action.data) } }
      );
    case UPDATE_PROJECT_SUCCESS:
      return update(state, { [action.data.pid]: { $merge: action.data } });
    case DELETE_PROJECT_SUCCESS:
      return omit(state, action.data.pid);
    case ADD_TASK_SUCCESS:
      return update(state,
        { [action.data.pid]: {
          tids: { $push: [action.data.tid] },
          pending: { $apply: pending => pending + 1 },
        } }
      );
    case DELETE_TASK_SUCCESS:
      return update(state,
        { [action.data.pid]: {
          tids: { $apply: tids => without(tids, action.data.tid) },
          pending: { $apply: pending => pending - (action.data.completed ? 0 : 1) },
        } }
      );
    default:
      return state;
  }
};
