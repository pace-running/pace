'use strict';
/* jshint node: true */
/* global describe, beforeEach, afterAll, it, expect, jasmine */
const mockery = require('mockery');
const Q = require('q');

describe('token service', () => {

    let tokens, dbHelperMock;

    beforeEach(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      mockery.resetCache();

      dbHelperMock = {
        select: jasmine.createSpy(),
        insert: jasmine.createSpy()
      };

      mockery.registerMock('../service/util/dbHelper', dbHelperMock);

      mockery.registerAllowables(['q', '../../service/util/dbHelper.js']);
      tokens = require('../../service/tokens');
      dbHelperMock.select.and.returnValue(Q.fcall(() => []));
      dbHelperMock.insert.and.returnValue(Q.fcall(() => 'some id'));
    });

    afterAll(() => {
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('createUnique()', () => {
      it('returns a string with 9 upper case characters', (done) => {

        tokens.createUnique()
          .then((uniqueToken) => {
            expect(uniqueToken.length).toBe(9);
            expect(uniqueToken).toBe(uniqueToken.toUpperCase());
            done();
          })
          .catch(done.fail);
      });
      it('returns a string that contains LGR-', (done) => {
        tokens.createUnique()
          .then((uniqueToken) => {
            expect(uniqueToken).toContain('LGR-');
            done();
          })
          .catch(done.fail);
      });

      it('checks if the token exists in the DB', (done) => {
        tokens.createUnique().then((uniqueToken) => {
          expect(dbHelperMock.select).toHaveBeenCalledWith('select * from participants where paymenttoken like $1', [uniqueToken]);
          done();
        }).catch(done.fail);
      });

      it('regenerates the token if already present in the DB', (done) => {
        let callCounter = 0;

        function fakeSelect() {
          if (callCounter === 0) {
            callCounter = callCounter + 1;
            return Q.fcall(() => ['someToken']);
          }
          return Q.fcall(() => []);
        }

        dbHelperMock.select.and.callFake(fakeSelect);

        tokens.createUnique().then((uniqueToken) => {
          expect(uniqueToken).toBeDefined();
          expect(dbHelperMock.select.calls.count()).toBe(2);
          done();
        });
      });
    });

  }
);
