const electron = require('electron');
const url = require('url');

module.exports = dataRouter => {
  electron.ipcMain.on('restAPI', (event, msg) => {
    const parsedUrl = url.parse(msg.url, true);
    const originalUrl = msg.url.replace(`${HOST}:${PORT}`, '');
    const baseUrl = REST_API_PATH;
    let statusCode = 200;
    const res = {
      status: code => {
        statusCode = code;
        return res;
      },
      send: text => {
        event.sender.send(msg.channel, {
          status: statusCode,
          statusText: text,
          data: {},
        });
        return res;
      },
      json: obj => {
        event.sender.send(msg.channel, {
          status: statusCode,
          statusText: 'OK',
          data: obj,
        });
        return res;
      },
    };
    dataRouter(
      {
        method: msg.method.toUpperCase(),
        originalUrl,
        baseUrl,
        url: originalUrl.replace(baseUrl, ''),
        _parsedUrl: parsedUrl,
        body: msg.data || {},
        query: parsedUrl.query,
        params: {},
        res,
      },
      res,
      () => 0
    );
  });
};
