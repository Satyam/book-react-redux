import ACTION_TYPES from './actionTypes.js';


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


export function getAllProjects() {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.ALL_PROJECTS_REQUEST,
    });
    return api.read('?fields=pid,name,pending')
      .then(
        response => dispatch({
          type: ACTION_TYPES.ALL_PROJECTS_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ACTION_TYPES.ALL_PROJECTS_FAILURE)
      );
  };
}

export function getProjectById(pid) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.PROJECT_BY_ID_REQUEST,
      pid,
    });
    return api.read(pid)
      .then(
        response => dispatch({
          type: ACTION_TYPES.PROJECT_BY_ID_SUCCESS,
          data: response.data,
        }),
        fail(dispatch, ACTION_TYPES.PROJECT_BY_ID_FAILURE)
      );
  };
}

export function addProject(name, descr) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.ADD_PROJECT_REQUEST,
      name,
      descr,
    });
    return api.create('', { name, descr })
      .then(
        response => dispatch({
          type: ACTION_TYPES.ADD_PROJECT_SUCCESS,
          data: Object.assign({ name, descr }, response.data),
        }),
        fail(dispatch, ACTION_TYPES.ADD_PROJECT_FAILURE)
      );
  };
}

export function updateProject(pid, name, descr) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.UPDATE_PROJECT_REQUEST,
      name,
      descr,
    });
    return api.update(pid, { name, descr })
      .then(
        response => dispatch({
          type: ACTION_TYPES.UPDATE_PROJECT_SUCCESS,
          data: Object.assign({ name, descr }, response.data),
        }),
        fail(dispatch, ACTION_TYPES.UPDATE_PROJECT_FAILURE)
      );
  };
}

export function deleteProject(pid) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.DELETE_PROJECT_REQUEST,
      pid,
    });
    return api.delete(pid)
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.DELETE_PROJECT_SUCCESS,
            data: response.data,
          });
        },
        fail(dispatch, ACTION_TYPES.DELETE_PROJECT_FAILURE)
      );
  };
}

export function addTaskToProject(pid, descr, completed) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.ADD_TASK_REQUEST,
      pid,
      descr,
      completed,
    });
    return api.create(pid, { descr })
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.ADD_TASK_SUCCESS,
            data: { descr, completed, pid, tid: String(response.data.tid) },
          });
        },
        fail(dispatch, ACTION_TYPES.ADD_TASK_FAILURE)
      );
  };
}

export function updateTask(pid, tid, descr, completed) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TASK_REQUEST,
      pid,
      tid,
      descr,
      completed,
    });
    return api.update(`/${pid}/${tid}`, { descr, completed })
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.UPDATE_TASK_SUCCESS,
            data: Object.assign({ descr, completed }, response.data),
          });
        },
        fail(dispatch, ACTION_TYPES.UPDATE_TASK_FAILURE)
      );
  };
}

export function deleteTask(pid, tid, completed) {
  return dispatch => {
    dispatch({
      type: ACTION_TYPES.DELETE_TASK_REQUEST,
      pid,
      tid,
    });
    return api.delete(`/${pid}/${tid}`)
      .then(
        response => {
          dispatch({
            type: ACTION_TYPES.DELETE_TASK_SUCCESS,
            data: Object.assign({ completed }, response.data),
          });
        },
        fail(dispatch, ACTION_TYPES.DELETE_TASK_FAILURE)
      );
  };
}

export const completedChanged = (pid, tid, descr, completed) =>
  dispatch =>
    dispatch(updateTask(pid, tid, descr, completed))
      .then(() =>
        dispatch({
          type: ACTION_TYPES.TASK_COMPLETED_CHANGE,
          pid,
          tid,
          completed,
        })
      )
  ;
