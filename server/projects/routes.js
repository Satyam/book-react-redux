const express = require('express');
const transactions = require('./transactions.js');
const validators = require('./validators.js');

const processPrj = (op) => (req, res) => {
  const valid = req.$valid;
  transactions[op](valid.keys, valid.data, valid.options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    if (data.pid) data.pid = String(data.pid);
    if (data.tid) data.tid = String(data.tid);
    res.json(data);
  });
};

module.exports = (dataRouter, branch, done) => {
  const projectsRouter = express.Router();
  dataRouter.use(branch, validators.add$valid, projectsRouter);

  projectsRouter
    .get('/',
      validators.validateOptions,
      processPrj('getAllProjects')
    )
    .get('/:pid',
      validators.validatePid,
      processPrj('getProjectById')
    )
    .get('/:pid/:tid',
      validators.validateTid,
      processPrj('getTaskByTid')
    )
    .post('/',
      validators.validatePrjData,
      processPrj('addProject')
    )
    .post('/:pid',
      validators.validatePid,
      validators.validateTaskData,
      processPrj('addTaskToProject')
    )
    .put('/:pid',
      validators.validatePid,
      validators.validatePrjData,
      processPrj('updateProject')
    )
    .put('/:pid/:tid',
      validators.validateTid,
      validators.validateTaskData,
      processPrj('updateTask')
    )
    .delete('/:pid',
      validators.validatePid,
      processPrj('deleteProject')
    )
    .delete('/:pid/:tid',
      validators.validateTid,
      processPrj('deleteTask')
    )
  ;

  transactions.init(done);
};
