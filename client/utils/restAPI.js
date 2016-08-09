import axios from 'axios';
import { join } from 'path';

let count = 0;
let ipc;
if (BUNDLE === 'electronClient') {
  /* eslint-disable import/no-extraneous-dependencies, global-require */
  ipc = require('electron').ipcRenderer;
  /* eslint-enable import/no-extraneous-dependencies, global-require */
}
const clients = {};

const adapter = (resolve, reject, config) => {
  const channel = `req-${count++}`;
  ipc.once(channel, (event, response) => {
    if (response.status < 300) {
      resolve(response);
    } else {
      reject(new Error(response.statusText));
    }
  });
  ipc.send('restAPI', {
    channel,
    url: config.url,
    method: config.method,
    data: config.data && JSON.parse(config.data),
  });
};

export default base => {
  if (clients[base]) return clients[base];
  const restClient = axios.create({
    baseURL: `${HOST}:${PORT}${join(REST_API_PATH, base)}`,
    responseType: 'json',
  });
  clients[base] = restClient;

  if (BUNDLE === 'electronClient') {
    restClient.defaults.adapter = adapter;
  }

  return Object.assign(restClient, {
    read: restClient.get,
    create: restClient.post,
    update: restClient.put,
  });
};
