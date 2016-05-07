const express = require('express');
const transactions = require('./transactions.js');
const validators = require('./validators.js');

const processPrj = (op, req, res) => {
  const valid = req.$valid;
  transactions[op](valid.keys, valid.data, valid.options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};

module.exports = (dataRouter, branch, done) => {
  const projectsRouter = express.Router();
  dataRouter.use(branch, validators.add$valid, projectsRouter);

  projectsRouter.get('/',
    validators.validateOptions,
    (req, res) => processPrj('getAllProjects', req, res)
  );

  projectsRouter.get('/:pid',
    validators.validatePid,
    (req, res) => processPrj('getProjectById', req, res)
  );

  projectsRouter.get('/:pid/:tid',
    validators.validateTid,
    (req, res) => processPrj('getTaskByTid', req, res)
  );

  projectsRouter.post('/',
    validators.validatePrjData,
    (req, res) => processPrj('addProject', req, res)
  );

  projectsRouter.post('/:pid',
    validators.validatePid,
    validators.validateTaskData,
    (req, res) => processPrj('addTaskToProject', req, res)
  );

  projectsRouter.put('/:pid',
    validators.validatePid,
    validators.validatePrjData,
    (req, res) => processPrj('updateProject', req, res)
  );

  projectsRouter.put('/:pid/:tid',
    validators.validateTid,
    validators.validateTaskData,
    (req, res) => processPrj('updateTask', req, res)
  );

  projectsRouter.delete('/:pid',
    validators.validatePid,
    (req, res) => processPrj('deleteProject', req, res)
  );

  projectsRouter.delete('/:pid/:tid',
    validators.validateTid,
    (req, res) => processPrj('deleteTask', req, res)
  );

  transactions.init(done);
};
