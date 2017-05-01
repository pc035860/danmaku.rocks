export default function boolish(obj_) {
  return function (name) {
    let obj;
    if (typeof obj_ === 'function') {
      obj = obj_(name);
    }
    else {
      obj = obj_;
    }

    if (obj[name] && (
          obj[name] === true   ||
          obj[name] === 'true' ||
          obj[name] === 1      ||
          obj[name] === '1'
        )
      ) {
      return true;
    }
    return false;
  };
}
