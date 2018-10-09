/* jshint node: true */
/* global jasmine */
'use strict';

const Pool = require('pg').Pool;
let pool;

let originalTimeout;

let journeyHelper = {};

journeyHelper.paceUrl = process.env.PACE_URL || 'http://localhost:3000/';

journeyHelper.getPaceWsUrl = (path) => {
  return journeyHelper.paceUrl.replace('http', 'ws') + path;
};

journeyHelper.changeOriginalTimeout = function () {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
};

journeyHelper.resetToOriginalTimeout = function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
};

journeyHelper.setupDbConnection = function (done) {
  pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'tcp://pgtester:pgtester@localhost/pace'
  });
  return pool.connect().then(client => {
      return client.query('delete from couponcodes')
          .then(() => client.query('delete from tshirts'))
          .then(() => client.query('delete from participants'))
          .then(() => client.query('delete from startblocks;'))
          .then(() => client.release())
          .then(() => {if(done) done();})
  }).catch((err) => {
      console.error('DB statement problem: ', err);
      done();
  });
};

journeyHelper.closeDbConnection = function (done) {
  pool.end() .then(() => { if(done) done(); })
  .catch((err) => {
    console.error('DB Pool end not successful: ', err);
    if(done) done.fail();
  });
};

module.exports = journeyHelper;
