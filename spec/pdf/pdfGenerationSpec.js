'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, xit, expect, beforeEach, afterAll, spyOn */

const mockery = require('mockery');
const Q = require('q');
const _ = require('lodash');
const config = require('config');

describe('pdfGeneration', () => {

  let pdfGeneration, res, participantsMock, documentMock, tshirtsMock, qrCodeMock, raceMock;
  let confirmedParticipant, unconfirmedParticipant;

  beforeEach(() => {

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    mockery.resetCache();

    res = {
      writeHead: jasmine.createSpy('writeHead')
    };

    documentMock = {
      pipe: jasmine.createSpy('pipe'),
      fontSize: function () {
        return documentMock;
      },
      font: function () {
        return documentMock;
      },
      fillColor: function () {
        return documentMock;
      },
      text: jasmine.createSpy('text'),
      scale: function () {
        return documentMock;
      },
      translate: function () {
        return documentMock;
      },
      path: function () {
        return documentMock;
      },
      lineWidth: function () {
        return documentMock;
      },
      stroke: jasmine.createSpy('stroke'),
      addPage: jasmine.createSpy('addPage'),
      image: jasmine.createSpy('image'),
      fill: jasmine.createSpy('fill'),
      end: jasmine.createSpy('end')
    };

    participantsMock = {
      get: {
        registered: jasmine.createSpy('registered'),
        confirmed: jasmine.createSpy('confirmed'),
        byId: jasmine.createSpy('byId'),
        blancParticipants: jasmine.createSpy('blancParticipants'),
        byStartnumber: jasmine.createSpy('byStartnumber')
      },
      saveBlanc: jasmine.createSpy('saveBlanc'),
      getTime: jasmine.createSpy('getTime'),
      rank: jasmine.createSpy('rank'),
      rankByCategory: jasmine.createSpy('rankByCategory')
    };

    tshirtsMock = {
      findAndAddTo: (p) => {
        return Q.fcall(() => p);
      }
    };

    qrCodeMock = {
      svgObject: () => {
        return qrCodeMock;
      },
      path: jasmine.createSpy('path')
    };

    raceMock = {
      startTime: jasmine.createSpy('startTime')
    };

    mockery.registerMock('../service/participants', participantsMock);
    mockery.registerMock('../service/tshirts', tshirtsMock);
    mockery.registerMock('../service/race', raceMock);
    mockery.registerMock('qr-image', qrCodeMock);
    pdfGeneration = require('../../pdf/pdfGeneration');

    confirmedParticipant = {
      secureid: 'adasdj12',
      firstname: 'Bestaetigte',
      lastname: 'Person',
      team: 'My Team',
      seconds: '1922',
      start_number: 1,
      start_block: 1,
      tshirt: {
        size: 'S',
        model: 'Unisex'
      },
      is_on_site_registration: false,
      has_payed: true
    };
    unconfirmedParticipant = {
      firstname: 'Unbestaetigte',
      lastname: 'Person',
      team: 'a team name',
      seconds: '1823',
      start_number: 2,
      start_block: 1
    };

    participantsMock.get.confirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.get.registered.and.returnValue(Q.fcall(() => [unconfirmedParticipant]));

    participantsMock.get.byStartnumber.and.returnValue(Q.fcall(() => confirmedParticipant));
    participantsMock.getTime.and.returnValue(Q.fcall(() => 10000));
    participantsMock.rank.and.returnValue(Q.fcall(() => 1));
    participantsMock.rankByCategory.and.returnValue(Q.fcall(() => 1));
    qrCodeMock.path.and.returnValue('some qr code path');
    raceMock.startTime.and.returnValue(Q.fcall(() => 101));
  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('extractData', () => {

    it('should get start number and name', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.startNumber).toEqual('1');
      expect(data.firstname).toEqual('Bestaetigte');
    });

    it('should get team', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.team).toEqual('My Team');
    });

    it('should get startBlock', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));
      //todo this comes now from the startblocks table and is a string
      expect(data.startBlock).toEqual('1');
    });

    it('should get tshirt details', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.tshirt.size).toEqual('S');
      expect(data.tshirt.model).toEqual('Unisex');
    });

    it('should get the payment inforamtion', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.hasPayed).toEqual(true);
    });

    it('should get the onSiteRegistration info', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.onSiteRegistration).toEqual(false);
    });

    it('should get the secureUrl link', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.secureUrl).toEqual('http://localhost:3000/editparticipant/adasdj12');
    });
  });

  describe('generateStartNumbers', () => {

    it('should request a start number for every participant', (done) => {
      let redis = {
        publish: jasmine.createSpy('publish')
      };

      pdfGeneration.generateStartNumbers(redis).then(() => {
        expect(redis.publish.calls.count()).toEqual(2);
        expect(redis.publish.calls.argsFor(0)).toEqual(['pace-pdf', pdfGeneration.extractData(confirmedParticipant)]);
        expect(redis.publish.calls.argsFor(1)).toEqual(['pace-pdf', pdfGeneration.extractData(unconfirmedParticipant)]);
        done();
      });
    });

  });

  describe('generateOnSiteStartNumbers', () => {
    let onSiteParticipant1 = {
      firstname: '',
      lastname: '',
      team: '',
      start_number: 3,
      secureid: 'some secure id',
      is_on_site_registration: true
    };

    let onSiteParticipant2 = {
      firstname: '',
      lastname: '',
      team: '',
      start_number: 4,
      secureid: 'some secure id',
      is_on_site_registration: true
    };

    beforeEach(() => {
      participantsMock.get.blancParticipants.and.returnValue(Q.fcall(() => [onSiteParticipant1,onSiteParticipant2]));
    });

    it('should request a start number for every blanc participant', (done) => {
      let redis = {
        publish: jasmine.createSpy('publish')
      };

      pdfGeneration.generateOnSiteStartNumbers(redis).then(() => {
        expect(redis.publish.calls.count()).toEqual(2);
        expect(redis.publish.calls.argsFor(0)).toEqual(['pace-pdf', pdfGeneration.extractData(onSiteParticipant1)]);
        expect(redis.publish.calls.argsFor(1)).toEqual(['pace-pdf', pdfGeneration.extractData(onSiteParticipant2)]);
        done();
      });

    });

  });

  describe('generateCertificate', () => {
    it('should generate one certificate', (done) => {
      pdfGeneration.generateCertificateDownload(res, documentMock, '1').then(() => {
        expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte Person', 0, 365, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('00:32:02', 0, 487, {align: 'center'});
        done();
      });
    });
  });

});
