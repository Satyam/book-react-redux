const send400 = (res) => void res.status(400).send('Bad request');

const testFields = /^\s*\w+\s*(,\s*\w+\s*)*$/;
const testSearch = /^\s*\w+\s*=\s*\w[\w\s]*$/;

module.exports = {
  add$valid: (req, res, next) => {
    req.$valid = {};
    next();
  },

  validatePid: (req, res, next) => {
    const pid = Number(req.params.pid);
    if (Number.isNaN(pid)) return send400(res);
    req.$valid.keys = {
      pid
    };
    next();
  },

  validateTid: (req, res, next) => {
    const pid = Number(req.params.pid);
    const tid = Number(req.params.tid);
    if (Number.isNaN(pid) || Number.isNaN(tid)) return send400(res);
    req.$valid.keys = {
      pid,
      tid
    };
    next();
  },

  validateOptions: (req, res, next) => {
    const fields = req.query.fields;
    const search = req.query.search;

    if (
      (fields && !testFields.test(fields)) ||
      (search && !testSearch.test(search))
    ) {
      return send400(res);
    }
    req.$valid.options = {
      fields,
      search
    };
    next();
  },

  validatePrjData: (req, res, next) => {
    const name = req.body.name;
    const descr = req.body.descr;
    if (name === undefined && descr === undefined) return send400(res);
    const data = {};
    if (name !== undefined) data.name = name;
    if (descr !== undefined) data.descr = descr;
    req.$valid.data = data;
    next();
  },

  validateTaskData: (req, res, next) => {
    const descr = req.body.descr;
    const completed = req.body.completed;
    if (descr === undefined && completed === undefined) return send400(res);
    const data = {};
    if (descr !== undefined) data.descr = descr;
    if (completed !== undefined) data.completed = !!completed;
    req.$valid.data = data;
    next();
  }
};
