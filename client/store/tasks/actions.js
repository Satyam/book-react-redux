import restAPI from '_utils/restAPI';
import asyncActionCreator from '_utils/asyncActionCreator';

const NAME = 'tasks/';

export const TASK_COMPLETED_CHANGE = `${NAME} Task completed changed`;
export const ADD_TASK = `${NAME} Add Task to Project`;
export const UPDATE_TASK = `${NAME} Update Task`;
export const DELETE_TASK = `${NAME} Delete Task`;

const api = restAPI('projects');

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
