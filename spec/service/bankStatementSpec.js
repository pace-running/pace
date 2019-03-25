'use strict';

const bankStatement = require('../../service/bankStatement');
const fs = require('fs');
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
    var readStream = fs.createReadStream(filename);
    bankStatement.parse(readStream)
      .then((results) => {
        let paymentRow = results[0];
        expect(paymentRow.getReason()).toContain('LGR-JHPQB');
        let possibleTokens = paymentRow.getPossibleTokens();
        expect(possibleTokens.length).toBe(2);
        expect(possibleTokens).toContain('LGR-JHPQB');
        expect(possibleTokens).toContain('Christoph');
        done();
      })
      .catch(done.fail);
  });
});
