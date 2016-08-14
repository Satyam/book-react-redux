import { expect } from 'chai';
import filter from 'lodash/filter';
import unique from 'lodash/uniq';

export default (collection, prefix) => () => {
  const actions = filter(collection, (value, name) =>
    (typeof value === 'string' && name.toUpperCase() === name));

  expect(actions).to.have.length.above(0);
  expect(unique(actions).length, 'no duplicates').to.equal(actions.length);
  actions.forEach(value => {
    const parts = value.split('/');
    expect(parts.length, 'has at least two parts').to.be.above(1);
    expect(parts[0], 'has same prefix').to.equal(prefix);
  });
};
