const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const server = require('..');

const PORT = process.env.npm_package_myServerApp_port || 8080;
const HOST = process.env.npm_package_myServerApp_host || 'http://localhost';

describe('Server testing', () => {
  before('Starting server', (done) => {
    server.start(done);
  });

  after('Closing the server', (done) => {
    db.all('PRAGMA integrity_check', (err, list) => {
      if (err) return done(err);
      expect(list).to.be.an.instanceof(Array);
      expect(list).to.have.length(1);
      expect(list[0]).to.be.an.instanceof(Object);
      expect(list[0].integrity_check).to.equal('ok');
      db.all('PRAGMA foreign_key_check', (err, list) => {
        if (err) return done(err);
        expect(list).to.be.an.instanceof(Array);
        expect(list).to.have.length(0);

        server.stop(done);
      });
    });
  });

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
        })
    );

    it('Get /index.html should return the same home page', () =>
      http.get('/index.html')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('text/html');
          expect(response.data).to.contain('<title>Sample Web Page</title>');
        })
    );
  });

  describe('/data/v2 REST API test', () => {
    const http = axios.create({
      baseURL: `${HOST}:${PORT}/data/v2/projects`,
      responseType: 'json'
    });

    it('Get on /projects should return project list', () =>
      http.get('/')
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
        )
    );

    it('Get on /projects with search term should return sought result', () =>
      http.get('/?search=name%3Domelette')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(1);
          const prj = data[0];
          expect(prj.pid).to.equal('34');
          expect(prj.name).to.contain('Spanish omelette');
          expect(prj.descr).to.contain('Spanish omelette');
        })
    );

    it('Get on /projects for some fields should return only those', () =>
      http.get('/?fields=name,pid')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.lengthOf(2);
          data.forEach((prj) => {
            switch (prj.pid) {
              case 25:
                expect(prj.name).to.contain('Web Dev Tools');
                expect(prj.descr).to.be.undefined;
                break;
              case 34:
                expect(prj.name).to.contain('Spanish omelette');
                expect(prj.descr).to.be.undefined;
                break;
              default:
                expect().to.not.be.ok;
                break;
            }
          });
        })
    );

    it('Get on /projects with search and fields', () =>
      http.get('/?search=name%3Domelette&fields=pid')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(1);
          const prj = data[0];
          expect(prj.pid).to.equal('34');
          expect(prj.name).to.be.undefined;
          expect(prj.descr).to.be.undefined;
        })
    );

    it('SQL injection ', () =>
      http.get('/?fields=* from sqlite_master;select *')
        .then(
          (response) => {
            throw new Error('Should not have let it go');
          },
          (response) => {
            expect(response.status).to.equal(400);
          }
        )
    );

    it('Get on /25 should return that project', () =>
      http.get('/25')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data.name).to.equal('Writing a Book on Web Dev Tools');
          expect(data.descr).to.equal('Tasks required to write a book on the tools required to develop a web application');
          const tasks = data.tasks;
          expect(tasks).to.be.an.array;
          expect(tasks).to.have.lengthOf(3);
          expect(tasks).to.eql([
            {
              tid: '1',
              descr: 'Figure out what kind of application to develop',
              completed: true
            },
            { tid: '2', descr: 'Decide what tools to use', completed: false },
            {
              tid: '3',
              descr: 'Create repositories for text and samples',
              completed: false
            }
          ]);
        })
    );

    it('Get on /projects/34/5 should return a task', () =>
      http.get('/34/5')
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('application/json');
          const data = response.data;
          expect(data.descr).to.equal('Fry the potatoes');
          expect(data.completed).to.be.true;
        })
    );

    it('Get on /projects/99 should fail', () =>
      http.get('/99')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Item(s) not found');
          }
        )
    );

    it('Get on /projects/34/99 should fail', () =>
      http.get('/34/99')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Item(s) not found');
          }
        )
    );

    it('Get on /projects/99/99 should fail', () =>
      http.get('/99/99')
        .then(
          (response) => {
            throw new Error('Should not have found it');
          },
          (response) => {
            expect(response.status).to.equal(404);
            expect(response.data).to.equal('Item(s) not found');
          }
        )
    );

    it('Post on /projects/99 should fail', () =>
      http.post('/99', { descr: '' })
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    it('Put on /projects/99 should fail', () =>
      http.put('/99', { descr: '' })
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    it('Put on /projects/34/99 should fail', () =>
      http.put('/34/99', { descr: '' })
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    it('Put on /projects/99/99 should fail', () =>
      http.put('/99/99', { descr: '' })
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    it('Delete on /projects/99 should fail', () =>
      http.delete('/99')
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    it('Delete on /projects/34/99 should fail', () =>
      http.delete('/34/99')
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    it('Delete on /projects/99/99 should fail', () =>
      http.delete('/99/99')
       .then(
         (response) => {
           throw new Error('Should not have found it');
         },
         (response) => {
           expect(response.status).to.equal(404);
           expect(response.data).to.equal('Item(s) not found');
         }
       )
    );

    describe('Creating and manipulating projects', () => {
      var pid;

      beforeEach('Create a new project', () =>
        http.post('/', {
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
          })
      );

      afterEach('Delete the project', () =>
        http.delete(`/${pid}`)
          .then(
            (response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              expect(response.data.pid).to.equal(pid);
            },
            (response) => {
              expect(response.status).to.equal(404);
              expect(response.data).to.equal('Item(s) not found');
            }
          )
      );

      it('New project should exist', () =>
        http.get(`/${pid}`)
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          })
      );

      it('Deleted project should be gone', () =>
        http.delete(`/${pid}`)
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            expect(response.data.pid).to.equal(pid);
            return http.get(`/${pid}`);
          })
          .then(
            (response) => {
              throw new Error('Should not have found it');
            },
            (response) => {
              expect(response.status).to.equal(404);
              expect(response.data).to.equal('Item(s) not found');
            }
          )
      );

      it('Change the project name', () =>
        http.put(`/${pid}`, {name: 'changed name'})
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.pid).to.equal(pid);
            return http.get(`/${pid}`);
          })
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.name).to.be.equal('changed name');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          })
      );

      it('Change the project description', () =>
        http.put(`/${pid}`, {descr: 'changed description'})
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.pid).to.equal(pid);
            return http.get(`/${pid}`);
          })
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.headers['content-type']).to.contain('application/json');
            const data = response.data;
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('changed description');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          })
      );

      describe('Managing tasks within project', () => {
        var tid;

        beforeEach('Add a task', () =>
          http.post(`/${pid}`, {
            descr: 'some task'
          })
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data).to.be.an.object;
              expect(data.tid).to.exist;
              tid = data.tid;
            })
        );

        afterEach('Delete the task', () =>
          http.delete(`/${pid}/${tid}`)
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data.pid).to.equal(pid);
              expect(data.tid).to.equal(tid);
            })
        );

        it('New task should exist', () =>
          http.get(`/${pid}/${tid}`)
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data.descr).to.be.equal('some task');
              expect(data.completed).to.be.false;
            })
        );

        it('Mark the task completed', () =>
          http.put(`/${pid}/${tid}`, {completed: true})
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data.pid).to.equal(pid);
              return http.get(`/${pid}/${tid}`);
            })
            .then((response) => {
              expect(response.status).to.equal(200);
              expect(response.headers['content-type']).to.contain('application/json');
              const data = response.data;
              expect(data.descr).to.be.equal('some task');
              expect(data.completed).to.be.true;
            })
        );
      });
    });
  });
});
