import { TaskListComponent, mapStateToProps } from 'components/projects/taskList';

import { expect, loadJSDOM, dropJSDOM, shallowRender } from 'test/utils/renderers';

import data from 'test/utils/data';

describe('Component: taskList', () => {
  before('create JSDOM', loadJSDOM);
  after('drop JSDOM', dropJSDOM);

  it('With no editTid it should produce 3 Tasks', () => {
    const taskList = shallowRender(
      TaskListComponent,
      {
        tids: data.projects[25].tids,
        pid: '25',
      }
    );
    expect(taskList.find('Connect(TaskComponent)')).to.have.lengthOf(3);
    const editTask = taskList.find('Connect(EditTaskComponent)');
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.be.undefined;
  });

  it('With editTid it should produce 2 Tasks and 1 EditTask', () => {
    const taskList = shallowRender(
      TaskListComponent,
      {
        tids: data.projects[25].tids,
        pid: '25',
        editTid: '2',
      }
    );
    expect(taskList.find('Connect(TaskComponent)')).to.have.lengthOf(2);
    const editTask = taskList.find('Connect(EditTaskComponent)');
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.equal('2');
  });

  it('With no tasks it should show sign of no tasks plus one EditTask', () => {
    const taskList = shallowRender(
      TaskListComponent,
      {
        pid: '99',
      }
    );
    const editTask = taskList.find('Connect(EditTaskComponent)');
    expect(editTask).to.have.lengthOf(1);
    expect(editTask.prop('tid')).to.be.undefined;
    expect(taskList.text()).to.have.string('No tasks found for project 99');
  });

  it('mapStateToProps', () => {
    const props = mapStateToProps(data, { pid: 25 });
    expect(props.tids).to.have.members(['1', '2', '3']);
    expect(props.editTid).to.be.null;
  });
});
