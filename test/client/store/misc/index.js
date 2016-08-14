import { expect } from 'chai';
/* eslint-disable import/no-duplicates, no-duplicate-imports */
import misc, { setEditTid, EDIT_TID } from '_store/misc';
import * as miscLib from '_store/misc';
/* eslint-enable import/no-duplicates, no-duplicate-imports */
import testConstants from '_test/utils/testConstants';

import { mockStore } from '_test/utils/renderers';
import data from '_test/utils/data';

describe('Store: misc', () => {
  describe('actions', () => {
    it('constants', testConstants(miscLib, 'misc'));
    describe('action creator: setEditTid', () => {
      it('static', () => {
        const action = setEditTid(2345);
        expect(action).to.be.object;
        expect(action).to.have.all.keys('type', 'tid');
        expect(action.type).to.equal(EDIT_TID);
        expect(action.tid).to.equal(2345);
      });
      it('dispatched', () => {
        const store = mockStore(data);
        store.dispatch(setEditTid(2345));
        const actions = store.getActions();
        expect(actions).to.have.lengthOf(1);
        expect(actions[0].type).to.equal(EDIT_TID);
        expect(actions[0].tid).to.equal(2345);
      });
    });
    describe('reducer', () => {
      it('set', () => {
        const newState = misc(data.misc, setEditTid(2345));
        expect(newState).to.eql({ editTid: 2345 });
      });
      it('reset', () => {
        const newState = misc(data.misc, setEditTid());
        expect(newState).to.eql({ editTid: undefined });
      });
    });
  });
});
