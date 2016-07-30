const ipc = require('electron').ipcRenderer;
const join = require('path').join;

let count = 0;

export default base => {
  const request = method => (path, data) => new Promise((resolve, reject) => {
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
      url: `${HOST}:${PORT}${join(REST_API_PATH, base, path)}`,
      method,
      data,
    });
  });
  return {
    read: request('GET'),
    create: request('POST'),
    update: request('PUT'),
    delete: request('DELETE'),
  };
};
