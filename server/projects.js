var nextId = 100;

module.exports = (router) => {
  // Routes for projects
  router.get('/', (req, res) => {
    res.json(Object.keys(data).map((pid) => ({
      pid: pid,
      name: data[pid].name,
      descr: data[pid].descr
    })));
  });

  router.get('/:pid', (req, res) => {
    const prj = data[req.params.pid];
    if (prj) {
      res.json(prj);
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });

  router.get('/:pid/:tid', (req, res) => {
    const prj = data[req.params.pid];
    if (prj) {
      const task = prj.tasks[req.params.tid];
      if (task) {
        res.json(task);
      } else {
        res.status(404).send(`Task ${req.params.tid} not found`);
      }
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });

  router.post('/', (req, res) => {
    const pid = nextId++;
    const prj = Object.assign({name: '', descr: '', tasks: {}}, req.body);
    data[pid] = prj;
    res.json({pid: pid});
  });

  router.post('/:pid', (req, res) => {
    const prj = data[req.params.pid];
    if (prj) {
      const tid = nextId++;
      prj.tasks[tid] = Object.assign({descr: '', completed: false}, req.body);
      res.json({tid: tid});
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });

  router.put('/:pid', (req, res) => {
    const prj = data[req.params.pid];
    if (prj) {
      Object.assign(prj, req.body);
      res.json(prj);
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });

  router.put('/:pid/:tid', (req, res) => {
    const prj = data[req.params.pid];
    if (prj) {
      const task = prj.tasks[req.params.tid];
      if (task) {
        Object.assign(task, req.body);
        res.json(task);
      } else {
        res.status(404).send(`Task ${req.params.tid} not found`);
      }
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });

  router.delete('/:pid', (req, res) => {
    if (req.params.pid in data) {
      delete data[req.params.pid];
      res.send();
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });

  router.delete('/:pid/:tid', (req, res) => {
    const prj = data[req.params.pid];
    if (prj) {
      if (req.params.tid in prj.tasks) {
        delete prj.tasks[req.params.tid];
        res.send();
      } else {
        res.status(404).send(`Task ${req.params.tid} not found`);
      }
    } else {
      res.status(404).send(`Project ${req.params.pid} not found`);
    }
  });
};
