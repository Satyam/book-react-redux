const expect = require('chai').expect;
const filter = require('lodash/filter');
const unique = require('lodash/uniq');

module.exports = (collection, prefix) => () => {
  const actions = filter(collection, (value, name) =>
    (typeof value === 'string' && name.toUpperCase() === name));

  expect(unique(actions).length, 'no duplicates').to.equal(actions.length);
  actions.forEach(value => {
    const parts = value.split('/');
    expect(parts.length, 'has at least two parts').to.be.above(1);
    expect(parts[0], 'has same prefix').to.equal(prefix);
  });
};
