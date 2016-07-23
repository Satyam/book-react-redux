import axios from 'axios';

const PORT = process.env.npm_package_myWebServer_port || 8080;
const HOST = process.env.npm_package_myWebServer_host || 'http://localhost';
let ipc = null;
if (global.window && window.process) {
  console.log(
    'electron?',
     window.process.type,
     window.process.versions && window.process.versions.electron
  );
  ipc = require('electron').ipcRenderer;
}
export default base => {
  const restClient = axios.create({
    baseURL: `${typeof window !== 'undefined'
      ? window.location.origin
      : `${HOST}:${PORT}`}/${base}`,
    responseType: 'json',
  });
  if (ipc) {
    console.log('**** found interceptor');
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
