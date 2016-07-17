const expect = require('chai').expect;
const filter = require('lodash/filter');
const unique = require('lodash/uniq');

export const testConstants = (collection, prefix) => () => {
  const actions = filter(collection, (value, name) =>
    (typeof value === 'string' && name.toUpperCase() === name));

  expect(unique(actions).length, 'no duplicates').to.equal(actions.length);
  actions.forEach(value => {
    const parts = value.split('/');
    expect(parts.length, 'has at least two parts').to.be.above(1);
    expect(parts[0], 'has same prefix').to.equal(prefix);
  });
};

const exposedProperties = ['window', 'navigator', 'document'];

import { jsdom } from 'jsdom';
export const loadJSDOM = done => {
  global.document = jsdom('');
  global.window = document.defaultView;
  Object.keys(document.defaultView).forEach(property => {
    if (typeof global[property] === 'undefined') {
      exposedProperties.push(property);
      global[property] = document.defaultView[property];
    }
  });

  global.navigator = {
    userAgent: 'node.js'
  };
  done();
};

export const dropJSDOM = () => {
  exposedProperties.forEach(prop => delete global[prop]);
};

import { renderIntoDocument, createRenderer } from 'react-addons-test-utils';

const renderer = createRenderer();
export const shallowRender = (Component, props) => {
  renderer.render(<Component {...props} />);
  return renderer.getRenderOutput();
};
export const deepRender = (Component, props) =>
  renderIntoDocument(<Component { ...props } />);

import { mount } from 'enzyme';

export const data = require('./data.js');

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
export const mockStore = configureStore([thunk]);

/* eslint-disable no-unused-vars */
import React from 'react';
import { Provider } from 'react-redux';
/* eslint-enable no-unused-vars */

export const fullRender = (Component, props = {}, store = mockStore(data)) => {
  return mount(
    <Provider store={store}>
      <Component {...props}/>
    </Provider>
  );
};
