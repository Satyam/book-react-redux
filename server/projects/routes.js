const expressRouter = require('express').Router;
const transactions = require('./transactions');
const validators = require('./validators');

const handleRequest = require('server/utils').handleRequest;

module.exports = (dataRouter, branch) => new Promise((resolve, reject) => {
  const projectsRouter = expressRouter();
  dataRouter.use(branch, projectsRouter);

  projectsRouter
    .get('/', handleRequest(
      validators.validateOptions,
      transactions.getAllProjects
    ))
    .get('/:pid', handleRequest(
      validators.validatePid,
      transactions.getProjectById
    ))
    .get('/:pid/:tid', handleRequest(
      validators.validatePid,
      validators.validateTid,
      transactions.getTaskByTid
    ))
    .post('/', handleRequest(
      validators.validatePrjData,
      transactions.addProject
    ))
    .post('/:pid', handleRequest(
      validators.validatePid,
      validators.validateTaskData,
      transactions.addTaskToProject
    ))
    .put('/:pid', handleRequest(
      validators.validatePid,
      validators.validatePrjData,
      transactions.updateProject
    ))
    .put('/:pid/:tid', handleRequest(
      validators.validatePid,
      validators.validateTid,
      validators.validateTaskData,
      transactions.updateTask
    ))
    .delete('/:pid', handleRequest(
      validators.validatePid,
      transactions.deleteProject
    ))
    .delete('/:pid/:tid', handleRequest(
      validators.validatePid,
      validators.validateTid,
      transactions.deleteTask
    ))
  ;
  resolve(transactions.init());
});
