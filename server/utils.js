export const failRequest = (code, message) => Promise.reject({ code, message });

export const handleRequest = (...args) => (req, res) => {
  const action = args[args.length - 1];
  const o = {
    keys: req.params,
    data: req.body,
    options: req.query,
  };

  Promise.all(args.slice(0, -1).map(validator => validator(o)))
  .then(() => action(o))
  .then(reply => res.json(reply))
  .catch(reason => {
    res.status(reason.code).send(reason.message);
  });
};

export const dolarizeQueryParams = (...objs) => {
  const params = {};
  objs.forEach(obj =>
    Object.keys(obj).forEach(key => {
      params[`$${key}`] = obj[key];
    })
  );
  return params;
};
