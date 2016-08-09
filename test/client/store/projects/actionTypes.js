import constants from 'client/store/projects/actionTypes.js';
import testConstants from 'test/utils/testConstants';

describe('Store: projects constants', () => {
  it('constants', testConstants(constants, 'projects'));
});
