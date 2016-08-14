import { failRequest, dolarizeQueryParams } from '_server/utils';

let prepared = null;

const sqlAllProjects =
  `select projects.*, count(tid) as pending from projects left join
  (select pid, tid from tasks where completed = 0)
  using (pid) group by pid`;

const lastID = () => db.exec('select last_insert_rowid();')[0].values[0][0];

export function init() {
  prepared = {
    selectAllProjects: db.prepare(sqlAllProjects),
    selectProjectByPid: db.prepare('select * from projects where pid = $pid'),
    selectTasksByPid: db.prepare('select tid, descr, completed from tasks where pid = $pid'),
    selectTaskByTid: db.prepare('select * from tasks where tid = $tid'),
    createProject: db.prepare('insert into projects (name, descr) values ($name, $descr)'),
    createTask: db.prepare(
      'insert into tasks (pid, descr, completed) values ($pid, $descr, $completed)'
    ),
    deleteProject: db.prepare('delete from projects where pid = $pid'),
    deleteTasksInProject: db.prepare('delete from tasks where pid = $pid'),
    deleteTask: db.prepare('delete from tasks where pid = $pid and tid = $tid'),
  };
}

export function getAllProjects(o) {
  const fields = o.options.fields;
  const search = o.options.search;
  const fetch = stmt => {
    const projects = [];
    let prj;
    while (stmt.step()) {
      prj = stmt.getAsObject();
      prj.pid = String(prj.pid);
      projects.push(prj);
    }
    stmt.reset();
    return projects;
  };

  return fetch(
    (fields || search)
    ? db.prepare(`select ${fields || '*'} from (${sqlAllProjects})
       ${search
         ? ` where ${search.replace(/([^=]+)=(.+)/, '$1 like "%$2%"')}`
         : ''
       }`
     )
     : prepared.selectAllProjects
   );
}

export function getProjectById(o) {
  const prj = prepared.selectProjectByPid.getAsObject({ $pid: o.keys.pid });
  if (Object.keys(prj).length === 0) {
    prepared.selectProjectByPid.reset();
    return failRequest(404, 'Item(s) not found');
  }
  prepared.selectProjectByPid.reset();
  prj.tasks = [];
  let task;
  const stmt = prepared.selectTasksByPid;
  if (stmt.bind(dolarizeQueryParams(o.keys))) {
    while (stmt.step()) {
      task = stmt.getAsObject();
      task.tid = String(task.tid);
      task.completed = !!task.completed;
      prj.tasks.push(task);
    }
    stmt.reset();
    return prj;
  }
  stmt.reset();
  return failRequest(500, 'Sql Statement binding failRequested');
}

export function getTaskByTid(o) {
  const task = prepared.selectTaskByTid.getAsObject(dolarizeQueryParams(o.keys));
  if (!task || task.pid !== o.keys.pid) {
    prepared.selectTaskByTid.reset();
    return failRequest(404, 'Item(s) not found');
  }
  task.completed = !!task.completed;
  task.tid = String(task.tid);
  prepared.selectTaskByTid.reset();
  return task;
}

export function addProject(o) {
  prepared.createProject.run({
    $name: o.data.name || 'New Project',
    $descr: o.data.descr || 'No description',
  });
  return { pid: String(lastID()) };
}

export function addTaskToProject(o) {
  if (prepared.selectProjectByPid.get(dolarizeQueryParams(o.keys)).length) {
    prepared.createTask.run({
      $descr: o.data.descr || 'No description',
      $completed: o.data.completed || 0,
      $pid: o.keys.pid,
    });
    prepared.selectProjectByPid.reset();
    return { tid: String(lastID()) };
  }
  prepared.selectProjectByPid.reset();
  return failRequest(404, 'Item(s) not found');
}

export function updateProject(o) {
  const sql = `update projects set ${
    Object.keys(o.data).map(field => `${field} = $${field}`)
  } where pid = $pid`;
  db.run(sql, dolarizeQueryParams(o.keys, o.data));
  if (db.getRowsModified()) {
    return { pid: String(o.keys.pid) };
  }
  return failRequest(404, 'Item(s) not found');
}

export function updateTask(o) {
  const sql = `update tasks set ${
    Object.keys(o.data).map(field => `${field} = $${field}`)
  } where pid = $pid and tid = $tid`;
  db.run(sql, dolarizeQueryParams(o.keys, o.data));
  if (db.getRowsModified()) {
    return {
      pid: String(o.keys.pid),
      tid: String(o.keys.tid),
    };
  }
  return failRequest(404, 'Item(s) not found');
}

export function deleteProject(o) {
  prepared.deleteTasksInProject.run({
    $pid: o.keys.pid,
  });
  prepared.deleteProject.run(dolarizeQueryParams(o.keys));
  if (db.getRowsModified()) {
    return { pid: String(o.keys.pid) };
  }
  return failRequest(404, 'Item(s) not found');
}

export function deleteTask(o) {
  prepared.deleteTask.run(dolarizeQueryParams(o.keys));
  if (db.getRowsModified()) {
    return {
      pid: String(o.keys.pid),
      tid: String(o.keys.tid),
    };
  }
  return failRequest(404, 'Item(s) not found');
}
