import { expect } from 'chai';

import {
  mockStore,
  actionExpects,
} from '_test/utils/renderers';
// uncomment following for data to be used when testing update or delete
// import data from '_test/utils/data';
import fetchMock from 'fetch-mock';

import {
  getAllProjects,
  addProject,
  ALL_PROJECTS,
  ADD_PROJECT,
  REQUEST_SENT,
  REPLY_RECEIVED,
} from '_store/actions.js';

const API = `${HOST}:${PORT}${REST_API_PATH}/projects`;


describe('projects actions', () => {
  describe('action creators', () => {
    let store;
    beforeEach(() => {
      store = mockStore({ projects: {} });
    });
    afterEach(fetchMock.restore);

    describe('getAllProjects', () => {
      it('standard reply', () => {
        const body = [
          { pid: 25, name: 'Writing a Book on Web Dev Tools' },
          { pid: 34, name: 'Cook a Spanish omelette' },
        ];
        fetchMock.get(`${API}/?fields=pid,name,pending`, body);

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
        fetchMock.get(`${API}/?fields=pid,name,pending`, 404);

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
              expect(action.payload).to.have.all.keys(
                'message', 'status', 'statusText', 'actionType', 'originalPayload'
              );
            }
          ));
      });
    });

    describe('addProject', () => {
      it('standard request', () => {
        fetchMock.post(API, { pid: '45' });

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
        fetchMock.post(API, 404);

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
              expect(action.payload).to.have.all.keys(
                'message', 'status', 'statusText', 'actionType', 'originalPayload'
              );
            }
          ));
      });
    });
    //
    // All other tests are very much alike
    //
  });
});
