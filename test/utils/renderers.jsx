/* esli nt-disable no-unused-vars */
import React from 'react';
import thunk from 'redux-thunk';
/* esli nt-enable no-unused-vars */
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import { mount, shallow } from 'enzyme';
import jsdom from 'jsdom';

import data from './data.js';


chai.use(chaiEnzyme());
export const expect = chai.expect;

const exposedProperties = ['window', 'navigator', 'document'];
/* global document:true */
export const loadJSDOM = done => {
  global.document = jsdom.jsdom('<div id="container"></div>', {
    FetchExternalResources: false,
    ProcessExternalResources: false,
    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
  });
  global.window = document.defaultView;
  Object.keys(document.defaultView).forEach(property => {
    if (typeof global[property] === 'undefined') {
      exposedProperties.push(property);
      global[property] = document.defaultView[property];
    }
  });
  global.navigator = {
    userAgent: 'node.js',
  };
  done();
};

export const dropJSDOM = () => {
  exposedProperties.forEach(prop => delete global[prop]);
};

const fakeThunk = () => next => action => {
  if (typeof action !== 'function') return next(action);
  next({
    type: 'thunkFunction',
    func: action,
  });
  return Promise.resolve();
};

export const mockStore = configureStore([thunk]);
export const fakeThunkStore = configureStore([fakeThunk]);

export const shallowRender = (Component, props) =>
  shallow(<Component {...props} />);

export const deepRender = (Component, props = {}, store = mockStore(data)) =>
  mount(
    <Provider store={store}>
      <Component {...props} />
    </Provider>,
    {
      attachTo: document.getElementById('container'),
    }
  );
