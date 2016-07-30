const expressRouter = require('express').Router;
const transactions = require('./transactions');
const validators = require('./validators');

const handle = require('server/utils').handle;

module.exports = (dataRouter, branch) => new Promise((resolve, reject) => {
  const projectsRouter = expressRouter();
  dataRouter.use(branch, projectsRouter);

  projectsRouter
    .get('/', handle(
      validators.validateOptions,
      transactions.getAllProjects
    ))
    .get('/:pid', handle(
      validators.validatePid,
      transactions.getProjectById
    ))
    .get('/:pid/:tid', handle(
      validators.validatePid,
      validators.validateTid,
      transactions.getTaskByTid
    ))
    .post('/', handle(
      validators.validatePrjData,
      transactions.addProject
    ))
    .post('/:pid', handle(
      validators.validatePid,
      validators.validateTaskData,
      transactions.addTaskToProject
    ))
    .put('/:pid', handle(
      validators.validatePid,
      validators.validatePrjData,
      transactions.updateProject
    ))
    .put('/:pid/:tid', handle(
      validators.validatePid,
      validators.validateTid,
      validators.validateTaskData,
      transactions.updateTask
    ))
    .delete('/:pid', handle(
      validators.validatePid,
      transactions.deleteProject
    ))
    .delete('/:pid/:tid', handle(
      validators.validatePid,
      validators.validateTid,
      transactions.deleteTask
    ))
  ;
  resolve(transactions.init());
});
