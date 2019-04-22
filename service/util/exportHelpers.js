/* jshint node: true */
'use strict';

var csv = require('fast-csv');
var participants = require('../participants');


let exportHelpers = {};


exportHelpers.csv = (res) => {
  participants.get.all()
    .then((p) => {
      csv.write(p, {headers: true})
      .pipe(res)
    });
};

module.exports = exportHelpers;
