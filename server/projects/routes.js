const express = require('express');
const transactions = require('./transactions.js');

const processPrj = (op, res, keys, data, options) => {
  transactions[op](keys, data, options, (err, data) => {
    if (err) return void res.status(500).send(err);
    if (data === null) return void res.status(404).send('Item(s) not found');
    res.json(data);
  });
};

const send400 = (res) => void res.status(400).send('Bad request');

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

module.exports = (dataRouter, done) => {
  const projectRouter = express.Router();
  dataRouter.use('/projects', projectRouter);

  projectRouter.get('/', (req, res) => {
    const fields = req.query.fields;
    const search = req.query.search;

    if (
      (fields && !testFields.test(fields)) ||
      (search && !testSearch.test(search))
    ) {
      return send400(res);
    }
    processPrj('getAllProjects', res, null, null, {fields, search});
  });

  projectRouter.get('/:pid', (req, res) => {
    const pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    processPrj('getProjectById', res, {pid});
  });

  projectRouter.get('/:pid/:tid', (req, res) => {
    const pid = Number(req.params.pid);
    const tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    processPrj('getTaskByTid', res, {pid, tid});
  });

  projectRouter.post('/', (req, res) => {
    const name = req.body.name;
    const descr = req.body.descr;
    if (name === undefined && descr === undefined) return send400(res);
    const data = {};
    if (name !== undefined) data.name = name;
    if (descr !== undefined) data.descr = descr;
    processPrj('addProject', res, null, data);
  });

  projectRouter.post('/:pid', (req, res) => {
    const pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    const descr = req.body.descr;
    const completed = req.body.completed;
    if (descr === undefined && completed === undefined) return send400(res);
    const data = {};
    if (descr !== undefined) data.descr = descr;
    if (completed !== undefined) data.completed = !!completed;
    processPrj('addTaskToProject', res, {pid}, data);
  });

  projectRouter.put('/:pid', (req, res) => {
    const pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    const name = req.body.name;
    const descr = req.body.descr;
    if (name === undefined && descr === undefined) return send400(res);
    const data = {};
    if (name !== undefined) data.name = name;
    if (descr !== undefined) data.descr = descr;
    processPrj('updateProject', res, {pid}, data);
  });

  projectRouter.put('/:pid/:tid', (req, res) => {
    const pid = Number(req.params.pid);
    const tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    const descr = req.body.descr;
    const completed = req.body.completed;
    if (descr === undefined && completed === undefined) return send400(res);
    const data = {};
    if (descr !== undefined) data.descr = descr;
    if (completed !== undefined) data.completed = !!completed;
    processPrj('updateTask', res, {pid, tid}, data);
  });

  projectRouter.delete('/:pid', (req, res) => {
    const pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    processPrj('deleteProject', res, {pid});
  });

  projectRouter.delete('/:pid/:tid', (req, res) => {
    const pid = Number(req.params.pid);
    const tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    processPrj('deleteTask', res, {pid, tid});
  });
  transactions.init(done);
};
