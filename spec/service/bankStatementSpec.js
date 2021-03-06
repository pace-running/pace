'use strict';

const bankStatement = require('../../service/bankStatement');
/* jshint node: true */
/* global describe, beforeAll, afterAll, it, expect */

describe('bank statement service', () => {


  beforeAll(() => {
  });

  afterAll(() => {
  });

  // @TODO: Handle more cases for csv parsing bank statement

  it('opens csv files', (done) => {
    let filename = './spec/service/bank_statement.csv';
    let file = {path: filename}
    bankStatement.parse(file)
      .then((results) => {
        let paymentRow = results[0];
        expect(paymentRow.getReason()).toContain('LGR-JHPQB');
        let possibleTokens = paymentRow.getPossibleTokens();
        expect(possibleTokens.length).toBe(1);
        expect(possibleTokens).toContain('LGR-JHPQB');
        done();
      })
      .catch(done.fail);
  });
});
