import { join } from 'path';


const clients = {};

export default base => {
  if (clients[base]) return clients[base];
  let restClient;
  if (BUNDLE === 'electronClient') {
    let count = 0;
    /* eslint-disable import/no-extraneous-dependencies, global-require */
    const ipc = require('electron').ipcRenderer;
    /* eslint-enable import/no-extraneous-dependencies, global-require */
    restClient = method => (path, body) => new Promise((resolve, reject) => {
      const channel = `req-${count++}`;
      ipc.once(channel, (event, response) => {
        if (response.status < 300) {
          resolve(response.data);
        } else {
          reject({
            status: response.status,
            statusText: response.statusText,
            message: `${method}: ${path} ${response.status} ${response.statusText}`,
          });
        }
      });
      ipc.send('restAPI', {
        channel,
        url: `${HOST}:${PORT}${join(REST_API_PATH, base, path)}`,
        method,
        data: body,
      });
    });
  } else {
    restClient = method => (path, body) => fetch(
      `${HOST}:${PORT}${join(REST_API_PATH, base, path)}`,
      {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body && JSON.stringify(body),
      }
    )
    .then(response => (
      response.ok
      ? response
      : Promise.reject({
        status: response.status,
        statusText: response.statusText,
        message: `${method}: ${response.url} ${response.status} ${response.statusText}`,
      })
    ))
    .then(response => response.json());
  }
  return (clients[base] = {
    create: restClient('post'),
    read: restClient('get'),
    update: restClient('put'),
    delete: restClient('delete'),
  });
};
