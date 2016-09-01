import { expect } from 'chai';

import {
  mockStore,
  actionExpects,
} from '_test/utils/renderers';
// uncomment following for data to be used when testing update or delete
// import data from '_test/utils/data';
import nock from 'nock';

import {
  getAllProjects,
  addProject,
  ALL_PROJECTS,
  ADD_PROJECT,
  REQUEST_SENT,
  REPLY_RECEIVED,
} from '_store/actions.js';

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
      it('standard reply', () => {
        const body = [
          { pid: 25, name: 'Writing a Book on Web Dev Tools' },
          { pid: 34, name: 'Cook a Spanish omelette' },
        ];
        nock(SERVER)
          .get(API)
          .query({ fields: 'pid,name,pending' })
          .reply(200, body);

        return store.dispatch(getAllProjects())
          .then(() => actionExpects(store,
            {
              type: ALL_PROJECTS,
              meta: { asyncAction: REQUEST_SENT },
              payload: {},
            },
            {
              type: ALL_PROJECTS,
              payload: body,
              meta: { asyncAction: REPLY_RECEIVED },
            }
          ));
      });
      it('error reply', () => {
        nock(SERVER)
          .get(API)
          .query({ fields: 'pid,name,pending' })
          .reply(404, 'Not found');

        return store.dispatch(getAllProjects())
          .then(() => actionExpects(store,
            {
              type: ALL_PROJECTS,
              meta: { asyncAction: REQUEST_SENT },
              payload: {},
            },
            action => {
              expect(action.type).to.equal(ALL_PROJECTS);
              expect(action.error).to.be.true;
              expect(action.payload.status).to.equal(404);
              expect(action.payload).to.have.all.keys('message', 'status', 'actionType', 'url');
            // url: contents might change in future releases
            // msg: nock will always return null, see: https://github.com/node-nock/nock/issues/469
            }
          ));
      });
    });

    describe('addProject', () => {
      it('standard request', () => {
        nock(SERVER)
          .post(API)
          .reply(200, { pid: '45' });

        return store.dispatch(addProject('name', 'descr'))
          .then(() => actionExpects(store,
            {
              type: ADD_PROJECT,
              payload: {
                name: 'name',
                descr: 'descr',
              },
              meta: { asyncAction: REQUEST_SENT },
            },
            {
              type: ADD_PROJECT,
              payload: { pid: '45', name: 'name', descr: 'descr' },
              meta: { asyncAction: REPLY_RECEIVED },
            }
          ));
      });
      it('error reply', () => {
        nock(SERVER)
          .post(API)
          .reply(404, 'Not found');

        return store.dispatch(addProject('name', 'descr'))
          .then(() => actionExpects(store,
            {
              type: ADD_PROJECT,
              payload: {
                name: 'name',
                descr: 'descr',
              },
              meta: { asyncAction: REQUEST_SENT },
            },
            action => {
              expect(action.type).to.equal(ADD_PROJECT);
              expect(action.error).to.be.true;
              expect(action.payload.status).to.equal(404);
              expect(action.payload).to.have.all.keys('message', 'status', 'actionType', 'url');
            }
            // url: contents might change in future releases
            // msg: nock will always return null, see: https://github.com/node-nock/nock/issues/469
          ));
      });
    });
    //
    // All other tests are very much alike
    //
  });
});
