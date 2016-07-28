export const fail = (code, message) => Promise.reject({code, message});

export const handle = (...args) => (req, res) => {
  const action = args[args.length - 1];
  const o = {
    keys: req.params,
    data: req.body,
    options: req.query,
    reply: {}
  };

  Promise.all(args.slice(0, -1).map(validator => validator(o)))
  .then(() => action(o))
  .then(() => res.json(o.reply))
  .catch(reason => {
    res.status(reason.code).send(reason.message);
  });
};
