const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const server = require('..');

const PORT = process.env.npm_package_myServerApp_port || 8080;

describe('Server testing', () => {
  before('Starting server', (done) => {
    server.listen(PORT, done);
  });

  after('Closing the server', (done) => {
    server.close(done);
  });

  describe('Static pages test', () => {
    const http = axios.create({
      baseURL: `http://localhost:${PORT}`
    });

    it('Get / should return home page', () => {
      return http.get('/')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('text/html');
          expect(response.data).to.contain('<title>Sample Web Page</title>');
        });
    });

    it('Get /index.html should return the same home page', () => {
      return http.get('/index.html')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('text/html');
          expect(response.data).to.contain('<title>Sample Web Page</title>');
        });
    });

    it('Get /xyz should return a "page not found" error', () => {
      return http.get('/xyz')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
          }
        );
    });
  });

  describe('/data/v1 REST API test', () => {
    const http = axios.create({
      baseURL: `http://localhost:${PORT}/data/v1/projects`,
      responseType: 'json'
    });

    it('Get on /projects should return project list', () => {
      return http.get('/')
        .then(
          (response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data).to.be.an.instanceof(Array);
            expect(data).to.have.length(2);
            data.forEach((prj) => {
              switch (prj.pid) {
                case 25:
                  expect(prj.name).to.contain('Web Dev Tools');
                  expect(prj.descr).to.contain('write a book');
                  break;
                case 34:
                  expect(prj.name).to.contain('Spanish omelette');
                  expect(prj.descr).to.contain('Spanish omelette');
                  break;
                default:
                  expect().to.not.be.ok;
                  break;
              }
            });
          }
        );
    });

    it('Get on //25 should return that project', () => {
      return http.get('/25')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data.name).to.equal('Writing a Book on Web Dev Tools');
          expect(data.descr).to.equal('Tasks required to write a book on the tools required to develop a web application');
          expect(data.tasks).to.be.an.object;
          const tasks = data.tasks;
          expect(tasks).to.have.all.keys('1', '2', '3');
          expect(tasks[1]).to.be.an.object;
          expect(tasks[1].descr).to.equal('Figure out what kind of application to develop');
          expect(tasks[1].completed).to.be.true;
        });
    });

    it('Get on /projects/34/5 should return a task', () => {
      return http.get('/34/5')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data.descr).to.equal('Fry the potatoes');
          expect(data.completed).to.be.true;
        });
    });

    it('Get on /projects/99 should fail', () => {
      return http.get('/99')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Project 99 not found');
          }
        );
    });

    it('Get on /projects/34/99 should fail', () => {
      return http.get('/34/99')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Task 99 not found');
          }
        );
    });

    it('Get on /projects/99/99 should fail', () => {
      return http.get('/99/99')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Project 99 not found');
          }
        );
    });

    describe('Creating and manipulating projects', () => {
      var pid;

      beforeEach('Create a new project', () => {
        return http.post('/', {
          name: 'new project',
          descr: 'new project for testing'
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data).to.be.an.object;
          expect(data.pid).to.exist;
          pid = data.pid;
        });
      });

      afterEach('Delete the project', () => {
        return http.delete(`/${pid}`)
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-length']).to.equal('0');
          });
      });

      it('New project should exist', () => {
        return http.get(`/${pid}`)
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          });
      });

      it('Change the project name', () => {
        return http.put(`/${pid}`, {name: 'changed name'})
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.name).to.be.equal('changed name');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          });
      });

      it('Change the project description', () => {
        return http.put(`/${pid}`, {descr: 'changed description'})
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('changed description');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          });
      });

      describe('Managing tasks within project', () => {
        var tid;

        beforeEach('Add a task', () => {
          return http.post(`/${pid}`, {
            descr: 'some task'
          })
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data).to.be.an.object;
              expect(data.tid).to.exist;
              tid = data.tid;
            });
        });

        afterEach('Delete the task', () => {
          return http.delete(`/${pid}/${tid}`)
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-length']).to.equal('0');
            });
        });

        it('New task should exist', () => {
          return http.get(`/${pid}/${tid}`)
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data.descr).to.be.equal('some task');
              expect(data.completed).to.be.false;
            });
        });

        it('Mark the task completed', () => {
          return http.put(`/${pid}/${tid}`, {completed: true})
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.descr).to.be.equal('some task');
            expect(data.completed).to.be.true;
          });
        });
      });
    });
  });
});
