const prepared = {};

const sqlAllProjects =
  `select projects.*, count(tid) as pending from projects left join
  (select pid, tid from tasks where completed = 0)
  using (pid) group by pid`;

const lastID = () => db.exec('select last_insert_rowid();')[0].values[0][0];

module.exports = {
  init: (done) => {
    prepared.selectAllProjects = db.prepare(sqlAllProjects);
    prepared.selectProjectByPid = db.prepare('select * from projects where pid = $pid');
    prepared.selectTasksByPid = db.prepare('select tid, descr, completed from tasks where pid = $pid');
    prepared.selectTaskByTid = db.prepare('select * from tasks where tid = $tid');
    prepared.createProject = db.prepare('insert into projects (name, descr) values ($name, $descr)');
    prepared.createTask = db.prepare('insert into tasks (pid, descr, completed) values ($pid, $descr, $completed)');
    prepared.deleteProject = db.prepare('delete from projects where pid = $pid');
    prepared.deleteTasksInProject = db.prepare('delete from tasks where pid = $pid');
    prepared.deleteTask = db.prepare('delete from tasks where pid = $pid and tid = $tid');
    done();
  },

  getAllProjects: (keys, data, options, done) => {
    const fields = options.fields;
    const search = options.search;
    const fetch = stmt => {
      let projects = [];
      let prj;
      while (stmt.step()) {
        prj = stmt.getAsObject();
        prj.pid = String(prj.pid);
        projects.push(prj);
      }
      stmt.reset();
      done(null, projects);
    };
    if (!(fields || search)) {
      fetch(prepared.selectAllProjects);
    } else {
      fetch(db.prepare('select ' +
        (fields || '*') +
        ' from ( ' + sqlAllProjects + ' )' +
         (search
           ? ' where ' + search.replace(/([^=]+)=(.+)/, '$1 like "%$2%"')
           : ''
         )
       ));
    }
  },

  getProjectById: (keys, data, options, done) => {
    const prj = prepared.selectProjectByPid.getAsObject({$pid: keys.pid});
    if (Object.keys(prj).length === 0) return done(null, null);
    prj.tasks = [];
    let task;
    const stmt = prepared.selectTasksByPid;
    if (stmt.bind({$pid: keys.pid})) {
      while (stmt.step()) {
        task = stmt.getAsObject();
        task.tid = String(task.tid);
        task.completed = !!task.completed;
        prj.tasks.push(task);
      }
      done(null, prj);
    } else done(new Error('Sql Statement binding failed'));
  },

  getTaskByTid: (keys, data, options, done) => {
    const task = prepared.selectTaskByTid.getAsObject({$tid: keys.tid});
    if (!task || task.pid !== keys.pid) return done(null, null);
    task.completed = !!task.completed;
    prepared.selectTaskByTid.reset();
    done(null, task);
  },

  addProject: (keys, data, options, done) => {
    prepared.createProject.run({
      $name: data.name || 'New Project',
      $descr: data.descr || 'No description'
    });
    done(null, {pid: lastID()});
  },

  addTaskToProject: (keys, data, options, done) => {
    if (prepared.selectProjectByPid.get({$pid: keys.pid}).length) {
      prepared.createTask.run({
        $descr: data.descr || 'No description',
        $completed: data.completed || 0,
        $pid: keys.pid
      });
      done(null, {tid: lastID()});
    } else done(null, null);
    prepared.selectProjectByPid.reset();
  },

  updateProject: (keys, data, options, done) => {
    const sql = 'update projects set ' +
      Object.keys(data).map((field) => `${field} = '${data[field]}'`) +
     ' where pid = ' + keys.pid;
    db.run(sql);
    if (db.getRowsModified()) {
      done(null, keys);
    } else {
      done(null, null);
    }
  },

  updateTask: (keys, data, options, done) => {
    const sql = 'update tasks set ' +
    Object.keys(data).map((field) => `${field} = '${data[field]}'`) +
    ` where pid = ${keys.pid} and tid = ${keys.tid}`;
    db.run(sql);
    if (db.getRowsModified()) {
      done(null, keys);
    } else {
      done(null, null);
    }
  },

  deleteProject: (keys, data, options, done) => {
    prepared.deleteTasksInProject.run({
      $pid: keys.pid
    });
    prepared.deleteProject.run({
      $pid: keys.pid
    });
    if (db.getRowsModified()) {
      done(null, keys);
    } else {
      done(null, null);
    }
  },

  deleteTask: (keys, data, options, done) => {
    prepared.deleteTask.run({
      $pid: keys.pid,
      $tid: keys.tid
    });
    if (db.getRowsModified()) {
      done(null, keys);
    } else {
      done(null, null);
    }
  }
};
