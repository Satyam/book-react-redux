import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'projects/';

export const ALL_PROJECTS = `${NAME} Get all projects`;
export const PROJECT_BY_ID = `${NAME} Get Project by id`;
export const ADD_PROJECT = `${NAME} Add Project`;
export const UPDATE_PROJECT = `${NAME} Update Project`;
export const DELETE_PROJECT = `${NAME} Delete Project`;

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
