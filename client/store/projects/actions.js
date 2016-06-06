export const TASK_COMPLETED_CHANGE = 'projects/Task completed changed';

export const completedChanged = (pid, tid, completed) => ({
  type: TASK_COMPLETED_CHANGE,
  pid,
  tid,
  completed,
});

import restAPI from 'utils/restAPI.js';

const api = restAPI('data/v2');

const fail = (dispatch, type) => response => {
  dispatch({
    type,
    status: response.status,
    msg: response.statusText,
    url: response.config.url.replace(response.config.baseURL, ''),
  });
};
export const ALL_PROJECTS_REQUEST = 'projects/Projects list request';
export const ALL_PROJECTS_SUCCESS = 'projects/Projects list received';
export const ALL_PROJECTS_FAILURE = 'projects/Projects list failed';

export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ALL_PROJECTS_REQUEST,
    });
    return api.read('/projects?fields=pid,name,pending')
      .then(
        response => dispatch({
          type: ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ALL_PROJECTS_FAILURE)
      );
  };
}

export const PROJECT_BY_ID_REQUEST = 'projects/Project info request';
export const PROJECT_BY_ID_SUCCESS = 'projects/Project info received';
export const PROJECT_BY_ID_FAILURE = 'projects/Project info failed';

export function getProjectById(pid) {
  return dispatch => {
    dispatch({
      type: PROJECT_BY_ID_REQUEST,
      pid,
    });
    return api.read(`/projects/${pid}`)
      .then(
        response => dispatch({
          type: PROJECT_BY_ID_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, PROJECT_BY_ID_FAILURE)
      );
  };
}
