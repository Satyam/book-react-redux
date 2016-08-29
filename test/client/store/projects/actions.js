import { expect } from 'chai';

import { mockStore } from '_test/utils/renderers';
// uncomment following for data to be used when testing update or delete
// import data from '_test/utils/data';
import nock from 'nock';

import {
  getAllProjects,
  addProject,
  ALL_PROJECTS,
  ADD_PROJECT,
} from '_store/projects/actions.js';

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
          .reply(200, body);

        store.dispatch(getAllProjects())
          .then(() => {
            expect(store.getActions()).to.eql(
              [
                {
                  type: ALL_PROJECTS,
                  meta: { request: true },
                  payload: {},
                },
                {
                  type: ALL_PROJECTS,
                  payload: body,
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
            expect(acts[0]).to.eql({
              type: ALL_PROJECTS,
              meta: { request: true },
              payload: {},
            });
            expect(acts[1].type).to.equal(ALL_PROJECTS);
            expect(acts[1].error).to.be.true;
            expect(acts[1].payload.status).to.equal(404);
            expect(acts[1].payload).to.have.all.keys('status', 'action', 'url');
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
                  type: ADD_PROJECT,
                  payload: {
                    name: 'name',
                    descr: 'descr',
                  },
                  meta: { request: true },
                },
                {
                  type: ADD_PROJECT,
                  payload: { pid: '45', name: 'name', descr: 'descr' },
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
            expect(acts[0].type).to.equal(ADD_PROJECT);
            expect(acts[1].type).to.equal(ADD_PROJECT);
            expect(acts[1].error).to.be.true;
            expect(acts[1].payload.status).to.equal(404);
            expect(acts[1].payload).to.have.all.keys('status', 'action', 'url');
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
