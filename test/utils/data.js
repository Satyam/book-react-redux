module.exports = {
  projects: {
    25: {
      pid: '25',
      name: 'Writing a Book on Web Dev Tools',
      descr: 'Tasks required to write a book on the tools required to develop a web application',
      tids: ['1', '2', '3'],
      pending: 1,
    },
    34: {
      pid: '34',
      name: 'Cook a Spanish omelette',
      descr: 'Steps to cook a Spanish omelette or "tortilla"',
      tids: ['4', '5', '6', '7', '8', '9'],
      pending: 4,
    },
  },
  tasks: {
    1: {
      tid: '1',
      descr: 'Figure out what kind of application to develop',
      completed: true,
    },
    2: {
      tid: '2',
      descr: 'Decide what tools to use',
      completed: false,
    },
    3: {
      tid: '3',
      descr: 'Create repositories for text and samples',
      completed: true,
    },
    4: {
      tid: '4',
      descr: 'Peel and dice the potatoes',
      completed: true,
    },
    5: {
      tid: '5',
      descr: 'Fry the potatoes',
      completed: true,
    },
    6: {
      tid: '6',
      descr: 'Peel and chop the onions',
      completed: false,
    },
    7: {
      tid: '7',
      descr: 'Saute the onions',
      completed: false,
    },
    8: {
      tid: '8',
      descr: 'Beat the eggs',
      completed: false,
    },
    9: {
      tid: '9',
      descr: 'Mix everything and fry',
      completed: false,
    },
  },
  requests: {
    pending: 0,
    errors: [],
  },
  misc: {
    editTid: null,
  },
};
