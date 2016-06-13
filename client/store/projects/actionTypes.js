const NAME = 'projects';

const constants = {
  TASK_COMPLETED_CHANGE: 'projects/Task completed changed',
};

[
  'ALL_PROJECTS',
  'PROJECT_BY_ID',
  'ADD_PROJECT',
  'UPDATE_PROJECT',
  'DELETE_PROJECT',
  'ADD_TASK',
  'UPDATE_TASK',
  'DELETE_TASK',
].forEach(operation => {
  [
    'REQUEST',
    'SUCCESS',
    'FAILURE',
  ].forEach(stage => {
    constants[`${operation}_${stage}`] = `${NAME}/${operation}/${stage}`;
  });
});

module.exports = constants;
