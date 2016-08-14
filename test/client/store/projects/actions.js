import { expect } from 'chai';

import { mockStore } from '_test/utils/renderers';
// uncomment following for data to be used when testing update or delete
// import data from '_test/utils/data';
import nock from 'nock';

import { getAllProjects, addProject } from '_store/projects/actions.js';
import ACTION_TYPES from '_store/projects/actionTypes.js';

const SERVER = `${HOST}:${PORT}`;
const API = `${REST_API_PATH}/projects/`;


describe('projects actions', () => {
  describe('action creators', () => {
    let store;
    beforeEach(() => {
      store = mockStore({ projects: {} });
    });
    afterEach(() => {
      nock.cleanAll();
    });
    describe('getAllProjects', () => {
      it('standard reply', done => {
        const body = [
          { pid: 25, name: 'Writing a Book on Web Dev Tools' },
          { pid: 34, name: 'Cook a Spanish omelette' },
        ];
        nock(SERVER)
          .get(API)
          .query({ fields: 'pid,name,pending' })
          .reply(200, { body });

        store.dispatch(getAllProjects())
          .then(() => {
            expect(store.getActions()).to.eql(
              [
                { type: ACTION_TYPES.ALL_PROJECTS_REQUEST },
                {
                  type: ACTION_TYPES.ALL_PROJECTS_SUCCESS,
                  data: { body },
                },
              ]);
          })
          .then(done)
          .catch(done);
      });
      it('error reply', done => {
        nock(SERVER)
          .get(API)
          .query({ fields: 'pid,name,pending' })
          .reply(404, 'Not found');

        store.dispatch(getAllProjects())
          .then(() => {
            const acts = store.getActions();
            expect(acts[0].type).to.equal(ACTION_TYPES.ALL_PROJECTS_REQUEST);
            expect(acts[1].type).to.equal(ACTION_TYPES.ALL_PROJECTS_FAILURE);
            expect(acts[1].status).to.equal(404);
            expect(acts[1]).to.have.all.keys('type', 'status', 'msg', 'url');
            // url: contents might change in future releases
            // msg: nock will always return null, see: https://github.com/node-nock/nock/issues/469
          })
          .then(done)
          .catch(done);
      });
    });

    describe('addProject', () => {
      it('standard request', done => {
        nock(SERVER)
          .post(API)
          .reply(200, { pid: '45' });

        store.dispatch(addProject('name', 'descr'))
          .then(() => {
            expect(store.getActions()).to.eql(
              [
                {
                  type: ACTION_TYPES.ADD_PROJECT_REQUEST,
                  name: 'name',
                  descr: 'descr',
                },
                {
                  type: ACTION_TYPES.ADD_PROJECT_SUCCESS,
                  data: { pid: '45', name: 'name', descr: 'descr' },
                },
              ]);
          })
          .then(done)
          .catch(done);
      });
      it('error reply', done => {
        nock(SERVER)
          .post(API)
          .reply(404, 'Not found');

        store.dispatch(addProject('name', 'descr'))
          .then(() => {
            const acts = store.getActions();
            expect(acts[0].type).to.equal(ACTION_TYPES.ADD_PROJECT_REQUEST);
            expect(acts[1].type).to.equal(ACTION_TYPES.ADD_PROJECT_FAILURE);
            expect(acts[1].status).to.equal(404);
            expect(acts[1]).to.have.all.keys('type', 'status', 'msg', 'url');
            // url: contents might change in future releases
            // msg: nock will always return null, see: https://github.com/node-nock/nock/issues/469
          })
          .then(done)
          .catch(done);
      });
    });
    //
    // All other tests are very much alike
    //
  });
});
