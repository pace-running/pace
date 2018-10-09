'use strict';
/* jshint node: true */
/* global describe, beforeAll, afterAll, it, expect, jasmine */
const mockery = require('mockery');

describe('race service', () => {

  let race, dbMock;

  beforeAll(() => {
    mockery.enable({useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false});
    mockery.resetCache();

    dbMock = {
      select: jasmine.createSpy()
    };
    mockery.registerMock('../service/util/dbHelper', dbMock);

    mockery.registerAllowables(['q', 'lodash', 'moment', 'fast-csv', '../domain/timeCalculator']);

    race = require('../../service/race');

  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });


  it('opens csv files', (done) => {
    race.parse('spec/service/results.csv')
      .then((data) => {
        console.log(data);
        expect(data[367]).toBe('1495811191');
        done();
      })
      .catch(done.fail);
  });
});
