'use strict';

const bankStatement = require('../../service/bankStatement');
/* jshint node: true */
/* global describe, beforeAll, afterAll, it, expect */

describe('bank statement service', () => {


  beforeAll(() => {
  });

  afterAll(() => {
  });


  it('opens csv files', (done) => {
    bankStatement.parse('spec/service/bank_statement.csv')
      .then((results) => {
        console.log(results[0]['Vorgang/Verwendungszweck']);
        expect(results[0]['Vorgang/Verwendungszweck']).toContain('JHPQB');
        done();
      })
      .catch(done.fail);
  });

  it('finds tokens in the Verwendungszweck')
});
