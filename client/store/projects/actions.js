import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'projects/';

export const TASK_COMPLETED_CHANGE = `${NAME} Task completed changed`;
export const ALL_PROJECTS = `${NAME} Get all projects`;
export const PROJECT_BY_ID = `${NAME} Get Project by id`;
export const ADD_PROJECT = `${NAME} Add Project`;
export const UPDATE_PROJECT = `${NAME} Update Project`;
export const DELETE_PROJECT = `${NAME} Delete Project`;
export const ADD_TASK = `${NAME} Add Task to Project`;
export const UPDATE_TASK = `${NAME} Update Task`;
export const DELETE_TASK = `${NAME} Delete Task`;

const api = restAPI('projects');

export function getAllProjects() {
  return asyncActionCreator(
    ALL_PROJECTS,
    api.read('?fields=pid,name,pending')
  );
}

export function getProjectById(pid) {
  return asyncActionCreator(
    PROJECT_BY_ID,
    api.read(pid),
    { pid }
  );
}

export function addProject(name, descr) {
  return asyncActionCreator(
    ADD_PROJECT,
    api.create('', { name, descr }),
    { name, descr }
  );
}

export function updateProject(pid, name, descr) {
  return asyncActionCreator(
    UPDATE_PROJECT,
    api.update(pid, { name, descr }),
    { pid, name, descr }
  );
}

export function deleteProject(pid) {
  return asyncActionCreator(
    DELETE_PROJECT,
    api.delete(pid),
    { pid }
  );
}

export function addTaskToProject(pid, descr, completed) {
  return asyncActionCreator(
    ADD_TASK,
    api.create(pid, { descr, completed }),
    { pid, descr, completed }
  );
}

export function updateTask(pid, tid, descr, completed) {
  return asyncActionCreator(
    UPDATE_TASK,
    api.update(`/${pid}/${tid}`, { descr, completed }),
    { pid, tid, descr, completed }
  );
}

export function deleteTask(pid, tid, completed) {
  return asyncActionCreator(
    DELETE_TASK,
    api.delete(`/${pid}/${tid}`),
    { pid, tid, completed }
  );
}

export const completedChanged = (pid, tid, descr, completed) =>
  dispatch =>
    dispatch(updateTask(pid, tid, descr, completed))
      .then(() =>
        dispatch({
          type: TASK_COMPLETED_CHANGE,
          pid,
          tid,
          completed,
        })
      )
  ;
