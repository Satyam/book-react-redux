
// const expect = require('chai').expect;

const constants = require('client/store/projects/actionTypes.js').default;
const { testConstants } = require('../../../utils');

describe('Store: projects constants', () => {
  it('constants', testConstants(constants, 'projects'));
});
