const expect = require('chai').expect;

import { TaskList } from 'components/projects/taskList.js';
import { Task } from 'components/projects/task.js';
import { EditTask } from 'components/projects/editTask.js';
import { EDIT_TID } from 'store/actions';

import { loadJSDOM, dropJSDOM, fullRender, data, mockStore } from '../../utils';

describe('Component: taskList', () => {
  before(loadJSDOM);
  after(dropJSDOM);
  it('With no editTid it should produce 3 Tasks', () => {
    const taskList = fullRender(
      TaskList,
      {
        tids: data.projects[25].tids,
        pid: '25',
      }
    );
    expect(taskList.find(Task)).to.have.lengthOf(3);
    const editTask = taskList.find(EditTask);
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.be.undefined;
  });
  it('With editTid it should produce 2 Tasks and 1 EditTask', () => {
    const taskList = fullRender(
      TaskList,
      {
        tids: data.projects[25].tids,
        pid: '25',
        editTid: '2',
      }
    );
    expect(taskList.find(Task)).to.have.lengthOf(2);
    const editTask = taskList.find(EditTask);
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.equal('2');
  });
  it('With no tasks it should show sign of no tasks plus one EditTask', () => {
    const taskList = fullRender(
      TaskList,
      {
        pid: '99',
      }
    );
    const editTask = taskList.find(EditTask);
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.be.undefined;
    expect(taskList.text()).to.have.string('No tasks found for project 99');
  });
  it('Click on a task edit button', () => {
    const store = mockStore(data);
    const taskList = fullRender(
      TaskList,
      {
        tids: data.projects[25].tids,
        pid: '25',
      },
      store
    );
    const task = taskList.find('Task').first();
    const tid = task.prop('tid');
    task.find('.glyphicon-pencil').simulate('click');
    const actionsList = store.getActions();
    expect(actionsList).to.have.lengthOf(1);
    const action = actionsList[0];
    expect(action.type).to.equal(EDIT_TID);
    expect(action.tid).to.equal(tid);
  });
});
