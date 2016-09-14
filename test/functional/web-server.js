import { expect } from 'chai';

import { start, stop } from '_server/server.js';
/* globals fetch:true */
require('isomorphic-fetch');

describe('Web Server testing', () => {
  before('Starting server', () => start()
    .then(() => console.log(`Server running at ${HOST}:${PORT}/`))
  );

  after('Closing the server', () => stop()
    .then(() => console.log(`Closing server at  ${HOST}:${PORT}/`))
  );

  describe('Static pages test', () => {
    it('Get / should return home page', () =>
      fetch(`${HOST}:${PORT}/`)
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers.get('content-type')).to.contain('text/html');
          return response.text().then(text => {
            expect(text).to.contain('<title>Sample Web Page</title>');
            expect(text).to.contain('<script id="initialState" type="application/json">');
            expect(text).to.contain('<div id="contents"');
          });
        })
    );
    it('Get /bootstrap should bring it', () =>
      fetch(`${HOST}:${PORT}/bootstrap/js/bootstrap.js`)
        .then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers.get('content-type')).to.contain('application/javascript');
          return response.text().then(text => {
            expect(text).to.contain('Bootstrap');
            expect(text).to.contain('Twitter');
          });
        })
    );
  });
});
