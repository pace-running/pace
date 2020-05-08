/* jshint node: true */
'use strict';
const db = require('../service/util/dbHelper');
const _ = require('lodash');

let numbers = {};

numbers.next = () => {
  return db.select('SELECT MAX(start_number) FROM participants', []).then((result) => {
    let number = parseInt(result[0].max);
    if (number) {
      return numbers.escape(number + 1);
    } else {
      return 1;
    }
  });
};

numbers.escape = (nr) => {
  if (_.includes([18, 28, 74, 84, 88, 444, 191, 192, 198, 420, 1312, 1717, 1887, 1910, 1919, 1933, 1488, 1681], nr)) {
    return numbers.escape(nr + 1);
  }
  return nr;
};

module.exports = numbers;
