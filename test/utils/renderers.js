/* eslint-disable no-unused-vars */
import React from 'react';
import { Provider } from 'react-redux';
/* eslint-enable no-unused-vars */
const chai = require('chai');
import chaiEnzyme from 'chai-enzyme';
chai.use(chaiEnzyme());
export const expect = chai.expect;

const exposedProperties = ['window', 'navigator', 'document'];

import jsdom from 'jsdom';
export const loadJSDOM = done => {
  global.document = jsdom.jsdom('<div id="container"></div>', {
    FetchExternalResources: false,
    ProcessExternalResources: false,
    virtualConsole: jsdom.createVirtualConsole().sendTo(console)
  });
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
const data = require('./data.js');

import configureStore from 'redux-mock-store';
const fakeThunk = store => next => action => {
  if (typeof action !== 'function') return next(action);
  next({
    type: 'thunkFunction',
    func: action
  });
  return Promise.resolve();
};

import thunk from 'redux-thunk';
export const mockStore = configureStore([thunk]);
export const fakeThunkStore = configureStore([fakeThunk]);

import { mount, shallow } from 'enzyme';

export const shallowRender = (Component, props) =>
  shallow(<Component {...props}/>);

export const deepRender = (Component, props = {}, store = mockStore(data)) =>
  mount(
    <Provider store={store}>
      <Component {...props}/>
    </Provider>,
    {
      attachTo: document.getElementById('container')
    }
  );
