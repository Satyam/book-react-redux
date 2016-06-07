import {
  TASK_COMPLETED_CHANGE,
  ALL_PROJECTS_SUCCESS,
  PROJECT_BY_ID_SUCCESS,
} from './actions';
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
    case ALL_PROJECTS_SUCCESS:
      return action.data.reduce(
        (projects, project) => (projects[project.pid]
          ? projects
          : update(projects, { $merge: { [project.pid]: project } })
        ),
        state
      );
    case PROJECT_BY_ID_SUCCESS: {
      const project = action.data;
      return update(
          state,
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
    default:
      return state;
  }
};
