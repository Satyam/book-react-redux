import pick from 'lodash/pick';

import ConnectedProject, {
  Project as PlainProject,
  mapStateToProps,
  mapDispatchToProps,
  initialDispatch,
} from 'components/projects/project.js';

import sinon from 'sinon';
import {
  expect,
  loadJSDOM,
  dropJSDOM,
  shallowRender,
  deepRender,
  mockStore,
  fakeThunkStore,
} from 'test/utils/renderers';
import setIntercept from 'test/utils/axiosInterceptor';
import data from 'test/utils/data';

const PID = 25;

describe('Component: Project', () => {
  describe('Shallow Render', () => {
    it('PlainProject with pid 25 should return entry', () => {
      const onEditClick = sinon.spy();
      const onDeleteClick = sinon.spy();
      const result = shallowRender(PlainProject, Object.assign({},
        pick(data.projects[PID], 'pid', 'name', 'descr'),
        {
          onEditClick,
          onDeleteClick,
        }
      ));
      expect(result.find('h1')).to.contain.text(data.projects[PID].name);
      expect(result.find('h1').parent().last()).to.contain.text(data.projects[PID].descr);
      expect(result.find('button')).to.have.lengthOf(2);
      expect(result.find('Connect(TaskList)')).to.have.lengthOf(1);
      expect(result.find('Connect(TaskList)')).to.have.prop('pid', String(PID));
    });
    it('PlainProject with no name should return not found message', () => {
      const onEditClick = sinon.spy();
      const onDeleteClick = sinon.spy();
      const result = shallowRender(PlainProject, {
        pid: '99',
        onEditClick,
        onDeleteClick,
      });
      expect(result).to.contain.text('Project 99 not found');
    });
  });
  describe('DOM renderers', () => {
    before(loadJSDOM);
    after(dropJSDOM);

    it('deepRender PlainProject', () => {
      const onEditClick = sinon.spy();
      const onDeleteClick = sinon.spy();
      const result = deepRender(PlainProject, Object.assign({},
        pick(data.projects[PID], 'pid', 'name', 'descr'),
        {
          onEditClick,
          onDeleteClick,
        }
      ));
      const heading = result.find('.project').childAt(0);
      expect(heading.find('h1')).to.contain.text(data.projects[PID].name);
      expect(heading.find('h1').parent().last()).to.contain.text(data.projects[PID].descr);
      expect(heading.find('button')).to.have.lengthOf(2);
      expect(result.find('Connect(TaskList)')).to.have.lengthOf(1);
      expect(result.find('Connect(TaskList)')).to.have.prop('pid', String(PID));
    });

    it('deepRender ConnectedProject with existing pid', () => {
      const store = mockStore(data);
      const result = deepRender(
        ConnectedProject,
        { params: { pid: String(PID) } },
        store
      );
      const heading = result.find('.project').childAt(0);
      expect(heading.find('h1')).to.contain.text(data.projects[PID].name);
      expect(heading.find('h1').parent().last()).to.contain.text(data.projects[PID].descr);
      expect(heading.find('button')).to.have.lengthOf(2);
      expect(result.find('Connect(TaskList)')).to.have.lengthOf(1);
      expect(result.find('Connect(TaskList)')).to.have.prop('pid', String(PID));
    });

    it('ConnectedProject with non-existing pid via fake dispatch', () => {
      const store = fakeThunkStore(data);

      const result = deepRender(
        ConnectedProject,
        { params: { pid: '99' } },
        store
      );
      expect(result).to.contain.text('Project 99 not found');
      const actions = store.getActions();
      const action = actions[0];
      const func = action.func;
      expect(func).to.be.a('function');
      expect(func.length).to.equal(1);
      expect(func.toString()).to.contain('.PROJECT_BY_ID_REQUEST');
    });

    it('ConnectedProject with non-existing pid via HTTP intercept', done => {
      setIntercept('projects', {
        method: 'get',
        url: '33',
        response: 'whatever',
      });
      const store = mockStore(data);
      store.subscribe(() => {
        const actions = store.getActions();
        if (actions.length === 2) {
          expect(actions[0]).to.eql({ type: 'projects/PROJECT_BY_ID/REQUEST', pid: '33' });
          expect(actions[1]).to.eql({ type: 'projects/PROJECT_BY_ID/SUCCESS', data: 'whatever' });
          setIntercept();
          done();
        }
      });
      const result = deepRender(
        ConnectedProject,
        { params: { pid: '33' } },
        store
      );
      expect(result).to.contain.text('Project 33 not found');
    });
  });
  it('mapStateToProps', () => {
    const props = mapStateToProps(data, { params: { pid: String(PID) } });
    expect(props).to.eql(data.projects[PID]);
  });

  describe('mapDispatchToProps', () => {
    it('onEditClick', () => {
      const store = fakeThunkStore(data);
      const props = mapDispatchToProps(store.dispatch);
      expect(props.onEditClick).to.be.a('function');
      props.onEditClick({ pid: PID });
      const actions = store.getActions();
      expect(actions.length).to.equal(1);
      const payload = actions[0].payload;
      expect(payload.args).to.have.lengthOf(1);
      expect(payload.args[0]).to.equal(`/projects/editProject/${PID}`);
    });

    it('onDeleteClick', done => {
      const store = fakeThunkStore(data);
      store.subscribe(() => {
        const actions = store.getActions();
        if (actions.length === 2) {
          expect(actions[0].func.toString()).to.contain('.DELETE_PROJECT_REQUEST');
          const payload = actions[1].payload;
          expect(payload.args).to.have.lengthOf(1);
          expect(payload.args[0]).to.equal('/projects');
          done();
        }
      });
      const props = mapDispatchToProps(store.dispatch);
      expect(props.onDeleteClick).to.be.a('function');
      props.onDeleteClick({ pid: PID });
    });
  });

  describe('initialDispatch', () => {
    it('with no pid', () => {
      const store = fakeThunkStore(data);
      const ret = initialDispatch(store.dispatch, { params: {} }, {}, store.getState());
      expect(ret).to.be.undefined;
    });

    it('with existing pid', () => {
      const store = fakeThunkStore(data);
      initialDispatch(store.dispatch, { params: { pid: String(PID) } }, {}, store.getState());
      expect(store.getActions()).to.have.lengthOf(0);
    });

    it('with new pid', () => {
      const store = fakeThunkStore(data);
      initialDispatch(store.dispatch, { params: { pid: '99' } }, {}, store.getState());
      const actions = store.getActions();
      expect(actions).to.have.lengthOf(1);
      expect(actions[0].type).to.equal('thunkFunction');
      expect(actions[0].func.toString()).to.contain('.PROJECT_BY_ID_REQUEST');
    });
  });
});
