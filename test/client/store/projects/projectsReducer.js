const expect = require('chai').expect;

import { diff as deepDiff } from 'deep-diff';
import diff from 'test/utils/diff.js';

import reducer from 'store/projects/projectsReducer';
import {
  TASK_COMPLETED_CHANGE,
  ALL_PROJECTS_SUCCESS,
  PROJECT_BY_ID_SUCCESS,
  ADD_PROJECT_SUCCESS,
  UPDATE_PROJECT_SUCCESS,
  DELETE_PROJECT_SUCCESS,
  ADD_TASK_SUCCESS,
  DELETE_TASK_SUCCESS,
} from 'store/projects/actionTypes';

import data from 'test/utils/data';
const projects = data.projects;

const diffAfter = (type, payload, initialState = projects) => diff(
  initialState,
  reducer(initialState, {
    type,
    data: payload,
  })
);

describe('Store: Projects, projectsReducer', () => {
  it('Empty state should return initial state', () => {
    expect(reducer(undefined, {})).to.eql({});
  });

  it('Unknown action should return state unmodified', () => {
    expect(reducer(projects, { type: 'xxxxxx' })).to.eql(projects);
  });

  it('Task completed should decrement pending count', () => {
    const d = diff(projects, reducer(projects, {
      type: TASK_COMPLETED_CHANGE,
      pid: 25,
      tid: 1,
      completed: true,
    }));
    expect(d).to.have.lengthOf(1);
    expect(d[0].path).to.equal('25');
    expect(deepDiff(d[0].old, d[0].new)).to.eql(
      [{ kind: 'E', path: ['pending'], lhs: 1, rhs: 0 }]
    );
  });
  it('Task not completed should increment pending count', () => {
    const d = diff(projects, reducer(projects, {
      type: TASK_COMPLETED_CHANGE,
      pid: 25,
      tid: 1,
      completed: false,
    }));
    expect(d).to.have.lengthOf(1);
    expect(d[0].path).to.equal('25');
    expect(deepDiff(d[0].old, d[0].new)).to.eql(
      [{ kind: 'E', path: ['pending'], lhs: 1, rhs: 2 }]
    );
  });

  describe('Get all projects success', () => {
    it('initial fetch', () => {
      expect(diffAfter(
        ALL_PROJECTS_SUCCESS,
        [{
          pid: '99',
          name: 'name for project 99',
          pending: 0,
        }],
        {}
      )).to.eql(
        [{
          path: '99',
          old: undefined,
          new: {
            pid: '99',
            name: 'name for project 99',
            pending: 0,
          },
        }]
      );
    });
    it('add extra project to existing set', () => {
      expect(diffAfter(
        ALL_PROJECTS_SUCCESS,
        [{
          pid: '99',
          name: 'name for project 99',
          pending: 0,
        }]
      )).to.eql([
        {
          path: '99',
          old: undefined,
          new: { pid: '99', name: 'name for project 99', pending: 0 },
        },
      ]);
    });
    it('merge project to existing set', () => {
      const d = diffAfter(
        ALL_PROJECTS_SUCCESS,
        [
          {
            pid: '99',
            name: 'name for project 99',
            pending: 0,
          },
          {
            pid: '34',
            name: 'Cook a Spanish omelette',
            pending: 4,
          },
        ]
      );
      expect(d).to.eql([
        {
          path: '99',
          old: undefined,
          new: { pid: '99', name: 'name for project 99', pending: 0 },
        },
      ]);
    });
  });

  describe('Get Project by pid', () => {
    const fullProject45 = {
      pid: '45',
      name: 'Name for project 45',
      descr: 'Description for project 45',
      tasks: [
        {
          tid: '45-1',
          descr: 'Task 1 for project 45',
          completed: true,
        },
        {
          tid: '45-2',
          descr: 'Task 2 for project 45',
          completed: false,
        },
      ],
    };
    const normalizedProject45 = {
      pid: '45',
      name: 'Name for project 45',
      descr: 'Description for project 45',
      tids: ['45-1', '45-2'],
    };
    it('Fetch new project', () => {
      const d = diffAfter(
        PROJECT_BY_ID_SUCCESS,
        fullProject45
      );
      expect(d).to.have.lengthOf(1);
      expect(d[0].path).to.equal('45');
      expect(d[0].old).to.be.undefined;
      expect(d[0].new).to.eql(normalizedProject45);
    });
    it('merge extra data over existing', () => {
      const initial = {
        pid: '45',
        name: 'Name for project 45',
        pending: 0,
      };
      const state = reducer({}, {
        type: ALL_PROJECTS_SUCCESS,
        data: [initial],
      });

      const d = diffAfter(
        PROJECT_BY_ID_SUCCESS,
        fullProject45,
        state
      );
      expect(d).to.eql([
        {
          path: '45',
          old: initial,
          new: Object.assign({}, initial, normalizedProject45),
        },
      ]);
    });
  });
  describe('add project', () => {
    it('New project added', () => {
      expect(diffAfter(
        ADD_PROJECT_SUCCESS,
        {
          pid: 35,
          name: 'Name for new project',
          descr: 'Descr for new project',
          tasks: [],
        }
      )).to.eql([
        {
          path: '35',
          old: undefined,
          new: {
            descr: 'Descr for new project',
            name: 'Name for new project',
            pending: 0,
            pid: 35,
            tasks: [],
          },
        },
      ]);
    });
  });
  it('Update project', () => {
    expect(diffAfter(
      UPDATE_PROJECT_SUCCESS,
      {
        pid: '34',
        name: 'new name',
      }
    )).to.eql([{
      path: '34',
      old: projects[34],
      new: Object.assign({}, projects[34], { name: 'new name' }),
    }]);
  });
  it('Delete project', () => {
    expect(diffAfter(
      DELETE_PROJECT_SUCCESS,
      {
        pid: '34',
      }
    )).to.eql([{
      path: '34',
      old: projects[34],
      new: undefined,
    }]);
  });
  it('Add task', () => {
    const d = diffAfter(
      ADD_TASK_SUCCESS,
      {
        pid: '25',
        tid: '10',
        descr: 'asdfasd fsdaf sdas', // descr ignored in projectsReducer
      }
    );
    expect(d).to.have.lengthOf(1);
    expect(d[0].path).to.equal('25');
    expect(deepDiff(d[0].old, d[0].new)).to.eql([
      { // tid added to array of tids in project
        path: ['tids'],
        kind: 'A',
        index: 3,
        item: {
          kind: 'N',
          rhs: '10',
        },
      },
      { // pending count incremented
        path: ['pending'],
        kind: 'E',
        lhs: 1,
        rhs: 2,
      },
    ]);
  });
  it('Delete task', () => {
    const d = diffAfter(
      DELETE_TASK_SUCCESS,
      {
        pid: '25',
        tid: '3',
      }
    );
    expect(d).to.have.lengthOf(1);
    expect(d[0].path).to.equal('25');
    expect(deepDiff(d[0].old, d[0].new)).to.eql([
      { // tid deleted from list of tids
        path: ['tids'],
        kind: 'A',
        index: 2,
        item: {
          kind: 'D',
          lhs: '3',
        },
      },
      { // pending count decremented
        path: ['pending'],
        kind: 'E',
        lhs: 1,
        rhs: 0,
      },
    ]);
  });
});
