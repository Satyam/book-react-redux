import {fail} from 'server/utils.js';

const prepared = {};

const sqlAllProjects =
  `select projects.*, count(tid) as pending from projects left join
  (select pid, tid from tasks where completed = 0)
  using (pid) group by pid`;

const lastID = () => db.exec('select last_insert_rowid();')[0].values[0][0];

module.exports = {
  init: () => {
    prepared.selectAllProjects = db.prepare(sqlAllProjects);
    prepared.selectProjectByPid = db.prepare('select * from projects where pid = $pid');
    prepared.selectTasksByPid = db.prepare('select tid, descr, completed from tasks where pid = $pid');
    prepared.selectTaskByTid = db.prepare('select * from tasks where tid = $tid');
    prepared.createProject = db.prepare('insert into projects (name, descr) values ($name, $descr)');
    prepared.createTask = db.prepare('insert into tasks (pid, descr, completed) values ($pid, $descr, $completed)');
    prepared.deleteProject = db.prepare('delete from projects where pid = $pid');
    prepared.deleteTasksInProject = db.prepare('delete from tasks where pid = $pid');
    prepared.deleteTask = db.prepare('delete from tasks where pid = $pid and tid = $tid');
  },

  getAllProjects: (o) => {
    const fields = o.options.fields;
    const search = o.options.search;
    const fetch = stmt => {
      let projects = [];
      let prj;
      while (stmt.step()) {
        prj = stmt.getAsObject();
        prj.pid = String(prj.pid);
        projects.push(prj);
      }
      stmt.reset();
      o.reply = projects;
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

  getProjectById: (o) => {
    const prj = prepared.selectProjectByPid.getAsObject({$pid: o.keys.pid});
    if (Object.keys(prj).length === 0) {
      prepared.selectProjectByPid.reset();
      return fail(404, 'Item(s) not found');
    }
    prepared.selectProjectByPid.reset();
    prj.tasks = [];
    let task;
    const stmt = prepared.selectTasksByPid;
    if (stmt.bind({$pid: o.keys.pid})) {
      while (stmt.step()) {
        task = stmt.getAsObject();
        task.tid = String(task.tid);
        task.completed = !!task.completed;
        prj.tasks.push(task);
      }
      stmt.reset();
      o.reply = prj;
    } else {
      stmt.reset();
      return fail(500, 'Sql Statement binding failed');
    }
  },

  getTaskByTid: (o) => {
    const task = prepared.selectTaskByTid.getAsObject({$tid: o.keys.tid});
    if (!task || task.pid !== o.keys.pid) {
      prepared.selectTaskByTid.reset();
      return fail(404, 'Item(s) not found');
    }
    task.completed = !!task.completed;
    task.tid = String(task.tid);
    prepared.selectTaskByTid.reset();
    o.reply = task;
  },

  addProject: (o) => {
    prepared.createProject.run({
      $name: o.data.name || 'New Project',
      $descr: o.data.descr || 'No description'
    });
    o.reply = {pid: String(lastID())};
  },

  addTaskToProject: (o) => {
    if (prepared.selectProjectByPid.get({$pid: o.keys.pid}).length) {
      prepared.createTask.run({
        $descr: o.data.descr || 'No description',
        $completed: o.data.completed || 0,
        $pid: o.keys.pid
      });
      o.reply = {tid: String(lastID())};
      prepared.selectProjectByPid.reset();
    } else {
      prepared.selectProjectByPid.reset();
      return fail(404, 'Item(s) not found');
    }
  },

  updateProject: (o) => {
    const sql = 'update projects set ' +
      Object.keys(o.data).map((field) => `${field} = '${o.data[field]}'`) +
     ' where pid = ' + o.keys.pid;
    db.run(sql);
    if (db.getRowsModified()) {
      o.reply.pid = String(o.keys.pid);
    } else {
      return fail(404, 'Item(s) not found');
    }
  },

  updateTask: (o) => {
    const sql = 'update tasks set ' +
    Object.keys(o.data).map((field) => `${field} = '${o.data[field]}'`) +
    ` where pid = ${o.keys.pid} and tid = ${o.keys.tid}`;
    db.run(sql);
    if (db.getRowsModified()) {
      o.reply.pid = String(o.keys.pid);
      o.reply.tid = String(o.keys.tid);
    } else {
      return fail(404, 'Item(s) not found');
    }
  },

  deleteProject: (o) => {
    prepared.deleteTasksInProject.run({
      $pid: o.keys.pid
    });
    prepared.deleteProject.run({
      $pid: o.keys.pid
    });
    if (db.getRowsModified()) {
      o.reply.pid = String(o.keys.pid);
    } else {
      return fail(404, 'Item(s) not found');
    }
  },

  deleteTask: (o) => {
    prepared.deleteTask.run({
      $pid: o.keys.pid,
      $tid: o.keys.tid
    });
    if (db.getRowsModified()) {
      o.reply.pid = String(o.keys.pid);
      o.reply.tid = String(o.keys.tid);
    } else {
      return fail(404, 'Item(s) not found');
    }
  }
};
