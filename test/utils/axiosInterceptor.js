import restAPI from 'restAPI';
import eq from 'lodash/eq';
import path from 'path';

let redirects = null;
let originalAdapter = null;
let api = null;

const adapter = (resolve, reject, config) => {
  if (!redirects.some(redirect => {
    if (
      config.method.toUpperCase() === redirect.method &&
      config.url === redirect.url &&
      (
        redirect.body
        ? (
          typeof redirect.body === 'function'
          ? redirect.body(config.data)
          : eq(redirect.body, config.data)
        )
        : true
      )
    ) {
      console.log('response', {
        status: 200,
        statusText: 'OK',
        data: redirect.response
      });
      resolve({
        data: redirect.response,
        status: 200,
        statusText: 'OK',
        config
      });
      return true;
    }
  })) {
    console.log('--not found--');
    reject({
      status: 404,
      statusText: 'Not Found',
      config
    });
  }
};

console.log('setting adapter');

export default (baseURL, config) => {
  if (baseURL) {
    api = restAPI(baseURL);
    redirects = (Array.isArray(config) ? config : [config]).map(redirect => ({
      method: redirect.method.toUpperCase(),
      url: `${HOST}:${PORT}${path.join(REST_API_PATH, baseURL, redirect.url)}`,
      body: redirect.body,
      response: redirect.response
    }));
    originalAdapter = api.defaults.adapter;
    api.defaults.adapter = adapter;
  } else {
    redirects = null;
    api.defaults.adapter = originalAdapter;
  }
};
