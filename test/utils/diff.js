const diff = (oldState, newState) => {
  const results = [];

  const diff1 = (oldValue, newValue, path) => {
    // console.log('vvvvvvvvvvvvvvvvvv', path);
    // console.log('old', typeof oldValue, oldValue);
    // console.log('new', typeof newValue, newValue);
    // console.log('^^^^^^^^^^^^^^^');
    if (oldValue && typeof oldValue === 'object' && newValue && typeof newValue === 'object') {
      // console.log('objects, lets check them');
      let prev = null;
      const keys = Object.keys(oldValue).concat(Object.keys(newValue)).sort();
      keys.forEach(key => {
        if (key === prev) return;
        prev = key;
        // console.log('checking', key);
        const o = oldValue[key];
        const n = newValue[key];
        if (o !== n) {
          results.push({
            path: path.concat(key).join('/'),
            old: o,
            new: n
          });
          // console.log('not the same 2:', results);
        } else {
          diff1(o, n, path.concat(key));
        }
      });
    } else {
      if (oldValue !== newValue && path.length) {
        results.push({
          path: path.join('/'),
          old: oldValue,
          new: newValue
        });
        // console.log('not the same 1:', results);
      }
    }
  };
  diff1(oldState, newState, []);
  return results;
};

export default diff;
