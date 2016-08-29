import React from 'react';
import thunk from 'redux-thunk';
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
    url: `${HOST}:${PORT}`,
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

export const mockStore = configureStore([thunk]);

export const actionExpects = (store, ...expects) =>
  new Promise((resolve, reject) => {
    const checkActions = () => {
      const actions = store.getActions();
      if (actions.length > expects.length) {
        reject(new chai.AssertionError(
          `Too many actions, expected ${expects.length}, actual ${actions.length}`
        ));
        return true;
      }
      try {
        actions.forEach((action, index) => {
          const e = expects[index];
          switch (typeof e) {
            case 'function':
              e(action);
              break;
            case 'object':
              expect(action).to.eql(e);
              break;
            default:
              expect(e).to.be.an('object');
              break;
          }
        });
        if (actions.length === expects.length) {
          resolve();
          return true;
        }
      } catch (e) {
        reject(e);
        return true;
      }
      return false;
    };
    if (!checkActions()) {
      store.subscribe(checkActions);
    }
  });


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
