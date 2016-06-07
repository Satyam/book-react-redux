export const TASK_COMPLETED_CHANGE = 'projects/Task completed changed';

export const completedChanged = (pid, tid, completed) => ({
  type: TASK_COMPLETED_CHANGE,
  pid,
  tid,
  completed,
});

import restAPI from 'utils/restAPI.js';

const api = restAPI('data/v2/projects');

const fail = (dispatch, type) => response => {
  dispatch({
    type,
    status: response.status,
    msg: response.statusText,
    url: response.config.url.replace(response.config.baseURL, ''),
  });
};
export const ALL_PROJECTS_REQUEST = 'projects/Projects list/REQUEST';
export const ALL_PROJECTS_SUCCESS = 'projects/Projects list/SUCCESS';
export const ALL_PROJECTS_FAILURE = 'projects/Projects list/FAILURE';

export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ALL_PROJECTS_REQUEST,
    });
    return api.read('?fields=pid,name,pending')
      .then(
        response => dispatch({
          type: ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ALL_PROJECTS_FAILURE)
      );
  };
}

export const PROJECT_BY_ID_REQUEST = 'projects/Project info/REQUEST';
export const PROJECT_BY_ID_SUCCESS = 'projects/Project info/SUCCESS';
export const PROJECT_BY_ID_FAILURE = 'projects/Project info/FAILURE';

export function getProjectById(pid) {
  return dispatch => {
    dispatch({
      type: PROJECT_BY_ID_REQUEST,
      pid,
    });
    return api.read(pid)
      .then(
        response => dispatch({
          type: PROJECT_BY_ID_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, PROJECT_BY_ID_FAILURE)
      );
  };
}
