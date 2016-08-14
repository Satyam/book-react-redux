import constants from '_store/projects/actionTypes.js';
import testConstants from '_test/utils/testConstants';

describe('Store: projects constants', () => {
  it('constants', testConstants(constants, 'projects'));
});
