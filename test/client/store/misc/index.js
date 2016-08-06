const expect = require('chai').expect;
const misc = require('store/misc/index.js');
const testConstants = require('test/utils/testConstants');

import { mockStore } from 'test/utils/renderers';
import data from 'test/utils/data';

describe('Store: misc', () => {
  describe('actions', () => {
    it('constants', testConstants(misc, 'misc'));
    describe('action creator: setEditTid', () => {
      it('static', () => {
        const action = misc.setEditTid(2345);
        expect(action).to.be.object;
        expect(action).to.have.all.keys('type', 'tid');
        expect(action.type).to.equal(misc.EDIT_TID);
        expect(action.tid).to.equal(2345);
      });
      it('dispatched', () => {
        const store = mockStore(data);
        store.dispatch(misc.setEditTid(2345));
        const actions = store.getActions();
        expect(actions).to.have.lengthOf(1);
        expect(actions[0].type).to.equal(misc.EDIT_TID);
        expect(actions[0].tid).to.equal(2345);
      });
    });
    describe('reducer', () => {
      it('set', () => {
        const newState = misc.default(data.misc, misc.setEditTid(2345));
        expect(newState).to.eql({ editTid: 2345 });
      });
      it('reset', () => {
        const newState = misc.default(data.misc, misc.setEditTid());
        expect(newState).to.eql({ editTid: undefined });
      });
    });
  });
});
