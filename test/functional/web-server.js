const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const server = require('server/server.js');

const PORT = process.env.npm_package_myWebServer_port || 8080;
const HOST = process.env.npm_package_myWebServer_host || 'http://localhost';

describe('Web Server testing', () => {
  before('Starting server', server.start);

  after('Closing the server', server.stop);

  describe('Static pages test', () => {
    const http = axios.create({
      baseURL: `${HOST}:${PORT}`
    });

    it('Get / should return home page', () =>
      http.get('/')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('text/html');
          expect(response.data).to.contain('<title>Sample Web Page</title>');
          expect(response.data).to.contain('<script id="initialState" type="application/json">');
          expect(response.data).to.contain('<div id="contents"');
        })
    );
    it('Get /bootstrap should bring it', () =>
      http.get('/bootstrap/js/bootstrap.js')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/javascript');
          expect(response.data).to.contain('Bootstrap');
          expect(response.data).to.contain('Twitter');
        })
    );
  });
});
