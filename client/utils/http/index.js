import axios from 'axios';

let ipc = null;
if (global.window && window.process) {
  console.log(
    'electron?',
     window.process.type,
     window.process.versions && window.process.versions.electron
  );
  ipc = require('electron').ipcRenderer;
  ipc.on('restAPI', (event, response) => {
    console.log('restAPI', response);
  });
}
export default base => {
  const restClient = axios.create({
    baseURL: `${typeof window !== 'undefined'
      ? window.location.origin
      : `${HOST}:${PORT}`}${REST_API_PATH}/${base}`,
    responseType: 'json',
  });
  if (ipc) {
    restClient.interceptors.request.use(
      config => {
        ipc.send('restAPI', config);
        return config;
        // return Promise.reject('no reason');
      },
      error => Promise.reject(error)
    );
  }

  return Object.assign(restClient, {
    read: restClient.get,
    create: restClient.post,
    update: restClient.put,
  });
};
