function print(obj) {
  if (typeof obj == 'undefined') {
    console.log("");
    return;
  }
  console.log(require('util').inspect(obj, true, 10)); // 10 levels deep
  return exports
}

exports.print = print;
exports.log = print;

