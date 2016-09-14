import { expect } from 'chai';
import restAPI from '_utils/restAPI';


import { start, stop } from '_server/server.js';

describe('Projects Data Server testing', () => {
  before('Starting server', () => start()
    .then(() => console.log(`Server running at http://localhost:${PORT}/`))
  );

  after('Closing the server', () => stop()
    .then(() => console.log(`Closing server at http://localhost:${PORT}/`))
  );

  describe(`${REST_API_PATH} REST API test`, () => {
    const api = restAPI('projects');

    it('Get on /projects should return project list', () =>
      api.read('/')
        .then(
          data => {
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
      api.read('/?search=name%3Domelette')
        .then(data => {
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(1);
          const prj = data[0];
          expect(prj.pid).to.equal('34');
          expect(prj.name).to.contain('Spanish omelette');
          expect(prj.descr).to.contain('Spanish omelette');
        })
    );

    it('Get on /projects for some fields should return only those', () =>
      api.read('/?fields=name,pid')
        .then(data => {
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
      api.read('/?search=name%3Domelette&fields=pid')
        .then(data => {
          expect(data).to.be.an.instanceof(Array);
          expect(data).to.have.length(1);
          const prj = data[0];
          expect(prj.pid).to.equal('34');
          expect(prj.name).to.be.undefined;
          expect(prj.descr).to.be.undefined;
        })
    );

    it('SQL injection ', () =>
      api.read('/?fields=* from sqlite_master;select *')
        .then(
          () => {
            throw new Error('Should not have let it go');
          },
          error => {
            expect(error.status).to.equal(400);
          }
        )
    );

    it('Get on /25 should return that project', () =>
      api.read('/25')
        .then(data => {
          expect(data.name).to.equal('Writing a Book on Web Dev Tools');
          expect(data.descr).to.equal(
            'Tasks required to write a book on the tools required to develop a web application'
          );
          const tasks = data.tasks;
          expect(tasks).to.be.an.array;
          expect(tasks).to.have.lengthOf(3);
          expect(tasks).to.eql([
            {
              tid: '1',
              descr: 'Figure out what kind of application to develop',
              completed: true,
            },
            { tid: '2', descr: 'Decide what tools to use', completed: false },
            {
              tid: '3',
              descr: 'Create repositories for text and samples',
              completed: false,
            },
          ]);
        })
    );

    it('Get on an invalid pid should return a validation error', () => {
      api.read('/abc')
        .then(
          () => {
            throw new Error('Should not have accepted it');
          },
          error => {
            expect(error.status).to.equal(400);
            expect(error.statusText).to.equal('Bad Request');
          }
        );
    });

    it('Get on /projects/34/5 should return a task', () =>
      api.read('/34/5')
        .then(data => {
          expect(data.descr).to.equal('Fry the potatoes');
          expect(data.completed).to.be.true;
        })
    );

    it('Get on /projects/99 should fail', () =>
      api.read('/99')
        .then(
          () => {
            throw new Error('Should not have found it');
          },
          error => {
            expect(error.status).to.equal(404);
            expect(error.statusText).to.equal('Not Found');
          }
        )
    );

    it('Get on /projects/34/99 should fail', () =>
      api.read('/34/99')
        .then(
          () => {
            throw new Error('Should not have found it');
          },
          error => {
            expect(error.status).to.equal(404);
            expect(error.statusText).to.equal('Not Found');
          }
        )
    );

    it('Get on /projects/99/99 should fail', () =>
      api.read('/99/99')
        .then(
          () => {
            throw new Error('Should not have found it');
          },
          error => {
            expect(error.status).to.equal(404);
            expect(error.statusText).to.equal('Not Found');
          }
        )
    );

    it('Post on /projects/99 should fail', () =>
      api.create('/99', { descr: '' })
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    it('Put on /projects/99 should fail', () =>
      api.update('/99', { descr: '' })
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    it('Put on /projects/34/99 should fail', () =>
      api.update('/34/99', { descr: '' })
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    it('Put on /projects/99/99 should fail', () =>
      api.update('/99/99', { descr: '' })
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    it('Delete on /projects/99 should fail', () =>
      api.delete('/99')
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    it('Delete on /projects/34/99 should fail', () =>
      api.delete('/34/99')
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    it('Delete on /projects/99/99 should fail', () =>
      api.delete('/99/99')
       .then(
         () => {
           throw new Error('Should not have found it');
         },
         error => {
           expect(error.status).to.equal(404);
           expect(error.statusText).to.equal('Not Found');
         }
       )
    );

    describe('Creating and manipulating projects', () => {
      let pid;

      beforeEach('Create a new project', () =>
        api.create('/', {
          name: 'new project',
          descr: 'new project for testing',
        })
          .then(data => {
            expect(data).to.be.an.object;
            expect(data.pid).to.exist;
            pid = data.pid;
          })
      );

      afterEach('Delete the project', () =>
        api.delete(`/${pid}`)
          .then(
            data => {
              expect(data.pid).to.equal(pid);
            },
            error => {
              expect(error.status).to.equal(404);
              expect(error.statusText).to.equal('Not Found');
            }
          )
      );

      it('New project should exist', () =>
        api.read(`/${pid}`)
          .then(data => {
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          })
      );

      it('Deleted project should be gone', () =>
        api.delete(`/${pid}`)
          .then(data => {
            expect(data.pid).to.equal(pid);
            return api.read(`/${pid}`);
          })
          .then(
            () => {
              throw new Error('Should not have found it');
            },
            error => {
              expect(error.status).to.equal(404);
              expect(error.statusText).to.equal('Not Found');
            }
          )
      );

      it('Change the project name', () =>
        api.update(`/${pid}`, { name: 'changed name' })
          .then(data => {
            expect(data.pid).to.equal(pid);
            return api.read(`/${pid}`);
          })
          .then(data => {
            expect(data.name).to.be.equal('changed name');
            expect(data.descr).to.be.equal('new project for testing');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          })
      );

      it('Change the project description', () =>
        api.update(`/${pid}`, { descr: 'changed description' })
          .then(data => {
            expect(data.pid).to.equal(pid);
            return api.read(`/${pid}`);
          })
          .then(data => {
            expect(data.name).to.be.equal('new project');
            expect(data.descr).to.be.equal('changed description');
            expect(data.tasks).to.be.an.object;
            expect(data.tasks).to.be.empty;
          })
      );

      describe('Managing tasks within project', () => {
        let tid;

        beforeEach('Add a task', () =>
          api.create(`/${pid}`, {
            descr: 'some task',
          })
            .then(data => {
              expect(data).to.be.an.object;
              expect(data.tid).to.exist;
              tid = data.tid;
            })
        );

        afterEach('Delete the task', () =>
          api.delete(`/${pid}/${tid}`)
            .then(data => {
              expect(data.pid).to.equal(pid);
              expect(data.tid).to.equal(tid);
            })
        );

        it('New task should exist', () =>
          api.read(`/${pid}/${tid}`)
            .then(data => {
              expect(data.descr).to.be.equal('some task');
              expect(data.completed).to.be.false;
            })
        );

        it('Mark the task completed', () =>
          api.update(`/${pid}/${tid}`, { completed: true })
            .then(data => {
              expect(data.pid).to.equal(pid);
              return api.read(`/${pid}/${tid}`);
            })
            .then(data => {
              expect(data.descr).to.be.equal('some task');
              expect(data.completed).to.be.true;
            })
        );
      });
    });
  });
});
