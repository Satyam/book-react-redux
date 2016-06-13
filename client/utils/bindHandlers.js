const rxHandler = /^on[A-Z].*Handler$/;

export default (obj, regXp = rxHandler) => {
  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach(prop => {
    if (regXp.test(prop)) {
      Object.defineProperty(obj, prop, {
        value: obj[prop].bind(obj),
        configurable: true,
        writable: true,
      });
    }
  });
};
