import {fail} from 'server/utils';

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

module.exports = {

  validatePid: ({keys, data, options, reply}) => {
    const pid = Number(keys.pid);
    if (Number.isNaN(pid)) return fail(400, 'Bad Request');
    keys.pid = pid;
  },

  validateTid: ({keys, data, options, reply}) => {
    const tid = Number(keys.tid);
    if (Number.isNaN(tid)) return fail(400, 'Bad Request');
    keys.tid = tid;
  },

  validateOptions: ({keys, data, options, reply}) => {
    const fields = options.fields;
    const search = options.search;

    if (
      (fields && !testFields.test(fields)) ||
      (search && !testSearch.test(search))
    ) {
      return fail(400, 'Bad Request');
    }
  },

  validatePrjData: ({keys, data, options, reply}) => {
    const name = data.name;
    const descr = data.descr;
    if (name === undefined && descr === undefined) return fail(400, 'Bad Request');
  },

  validateTaskData: ({keys, data, options, reply}) => {
    const descr = data.descr;
    const completed = data.completed;
    if (descr === undefined && completed === undefined) return fail(400, 'Bad Request');
  }
};
