import { failRequest } from '_server/utils';

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

/* eslint-disable no-param-reassign, consistent-return */
export function validatePid({ keys }) {
  const pid = Number(keys.pid);
  if (Number.isNaN(pid)) return failRequest(400, 'Bad Request');
  keys.pid = pid;
}

export function validateTid({ keys }) {
  const tid = Number(keys.tid);
  if (Number.isNaN(tid)) return failRequest(400, 'Bad Request');
  keys.tid = tid;
}

export function validateOptions({ options }) {
  const fields = options.fields;
  const search = options.search;

  if (
    (fields && !testFields.test(fields)) ||
    (search && !testSearch.test(search))
  ) {
    return failRequest(400, 'Bad Request');
  }
}

export function validatePrjData({ data }) {
  const name = data.name;
  const descr = data.descr;
  if (name === undefined && descr === undefined) return failRequest(400, 'Bad Request');
}

export function validateTaskData({ data }) {
  const descr = data.descr;
  const completed = data.completed;
  if (descr === undefined && completed === undefined) return failRequest(400, 'Bad Request');
}
