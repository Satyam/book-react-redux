/*global db:false */
'use strict';
module.exports = (router, done) => {
  const selectAllProjects = db.prepare('select * from projects', (err) => {
    if (err) return done(err);
  });
  const selectProjectByPid = db.prepare('select * from projects where pid = $pid', (err) => {
    if (err) return done(err);
  });
  const selectTasksByPid = db.prepare('select tid, descr, completed from tasks where pid = $pid', (err) => {
    if (err) return done(err);
  });
  const selectTaskByTid = db.prepare('select * from tasks where tid = $tid', (err) => {
    if (err) return done(err);
  });
  const createProject = db.prepare('insert into projects (name, descr) values ($name, $descr)', (err) => {
    if (err) return done(err);
  });
  const createTask = db.prepare('insert into tasks (pid, descr, completed) values ($pid, $descr, $completed)', (err) => {
    if (err) return done(err);
  });
  const deleteProject = db.prepare('delete from projects where pid = $pid', (err) => {
    if (err) return done(err);
  });
  const deleteTasksInProject = db.prepare('delete from tasks where pid = $pid', (err) => {
    if (err) return done(err);
  });
  const deleteTask = db.prepare('delete from tasks where pid = $pid and tid = $tid', (err) => {
    if (err) return done(err);
  });

  router.get('/', (req, res) => {
    selectAllProjects.all((err, prjs) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(prjs);
      }
    });
  });

  router.get('/:pid', (req, res) => {
    selectProjectByPid.get({$pid: req.params.pid}, (err, prj) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (!prj) {
        res.status(404).send(`Project ${req.params.pid} not found`);
        return;
      }
      selectTasksByPid.all({$pid: req.params.pid}, (err, tasks) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        prj.tasks = tasks.reduce((prev, current) => {
          prev[current.tid] = {
            descr: current.descr,
            completed: !!current.completed
          };
          return prev;
        }, {});
        res.json(prj);
      });
    });
  });

  router.get('/:pid/:tid', (req, res) => {
    selectTaskByTid.get({$tid: req.params.tid}, (err, task) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (!task || task.pid !== parseInt(req.params.pid, 10)) {
        res.status(404).send(`Task ${req.params.tid} in project ${req.params.pid} not found`);
        return;
      }
      task.completed = !!task.completed;
      res.json(task);
    });
  });

  router.post('/', (req, res) => {
    createProject.run({
      $name: req.body.name,
      $descr: req.body.descr
    }, function (err) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json({pid: this.lastID});
    });
  });

  router.post('/:pid', (req, res) => {
    selectProjectByPid.get({$pid: req.params.pid}, (err, prj) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (!prj) {
        res.status(404).send(`Project ${req.params.pid} not found`);
        return;
      }
      createTask.run({
        $descr: req.body.descr || '',
        $completed: req.body.completed || 0,
        $pid: req.params.pid
      }, function (err) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.json({tid: this.lastID});
      });
    });
  });

  router.put('/:pid', (req, res) => {
    let sql = 'update projects set ' +
      Object.keys(req.body).map((column) => `${column} = $${column}`).join(',') +
     ' where pid = $pid';

    db.run(sql, {
      $name: req.body.name,
      $descr: req.body.descr,
      $pid: req.params.pid
    }, function (err) {
      if (err) {
        if (err.errno === 25) {
          res.status(404).send(`project ${req.params.pid} not found`);
        } else {
          res.status(500).send(err);
        }
        return;
      }
      if (this.changes) {
        res.json({pid: req.params.pid});
      } else {
        res.status(404).send(`Project ${req.params.pid} not found`);
      }
    });
  });

  router.put('/:pid/:tid', (req, res) => {
    let sql = 'update tasks set ' +
      Object.keys(req.body).map((column) => `${column} = $${column}`).join(',') +
      ' where pid = $pid and tid = $tid';

    db.run(sql, {
      $descr: req.body.descr,
      $completed: req.body.completed ? 1 : 0,
      $pid: req.params.pid,
      $tid: req.params.tid
    }, function (err) {
      if (err) {
        if (err.errno === 25) {
          res.status(404).send(`Task ${req.params.tid} in project ${req.params.pid} not found`);
        } else {
          res.status(500).send(err);
        }
        return;
      }
      if (this.changes) {
        res.json({pid: req.params.pid, tid: req.params.tid});
      } else {
        res.status(404).send(`Task ${req.params.tid} in project ${req.params.pid} not found`);
      }
    });
  });

  router.delete('/:pid', (req, res) => {
    deleteTasksInProject.run({
      $pid: req.params.pid
    }, function (err) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      deleteProject.run({
        $pid: req.params.pid
      }, function (err) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        if (this.changes) {
          res.end();
        } else {
          res.status(404).send(`Project ${req.params.pid} not found`);
        }
      });
    });
  });

  router.delete('/:pid/:tid', (req, res) => {
    deleteTask.run({
      $pid: req.params.pid,
      $tid: req.params.tid
    }, function (err) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (this.changes) {
        res.end();
      } else {
        res.status(404).send(`Task ${req.params.tid} in project ${req.params.pid} not found`);
      }
    });
  });
  done();
};
