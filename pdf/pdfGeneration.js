/* jshint node: true */
'use strict';
const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
require("moment-duration-format");
const participants = require('../service/participants');
const tshirts = require('../service/tshirts');
const startblocks = require('../service/startblocks');

const editUrlHelper = require('../domain/editUrlHelper');
const timeCalculator = require('../domain/timeCalculator');

let pdfGeneration = {};

let getParticipants = () => {
  return participants.get.all()
    .then(participants => Q.all(participants.map(tshirts.findAndAddTo)));
};

pdfGeneration.extractData = (participant) => {
  return JSON.stringify({
    startNumber: _.toString(participant.start_number),
    firstname: participant.firstname,
    team: participant.team,
    startBlock: _.toString(participant.start_block + 1), //be careful not to use the id as the block name
    startBlockColor: participant.start_block_color,
    tshirt: participant.tshirt,
    hasPayed: participant.has_payed,
    onSiteRegistration: participant.is_on_site_registration,
    secureUrl: editUrlHelper.generateUrl(participant.secureid)
  });
};

pdfGeneration.generateStartNumbers = (redis) => {
  return Q.all([participants.get.all(), startblocks.all()])
    .then((results) => {
      return participants.distributeIntoStartblocks(results[0], results[1]);
    })
    .then(participants.assign)
    .then(getParticipants)
    .then((participants) => {
        let msgs = participants.map(pdfGeneration.extractData);
        console.log(`[GENERATE START NUMBERS] about to publish %s messages to pace-pdf`,msgs.length );
        _.forEach(msgs, m => redis.publish('pace-pdf', m));
      }
    );
};

//todo how should we deal with this
// [ ] first move to certificates.js
const pathToCertificateBackgroundImage = '/images/certificate_background.jpg';
const PDFDocument = require('pdfkit');

pdfGeneration.createCertificatePage = (doc, participant) => {
  const deferred = Q.defer();
  participants.rankByCategory(participant.start_number).then(category_rank => {
    participants.rank(participant.start_number).then(rank => {
      participants.getTime(participant.start_number).then(time => {
        if (_.isNull(time)) {
          deferred.reject();
        } else {
          let timestring = moment.duration(_.toNumber(participant.seconds), 'seconds').format("hh:mm:ss", {trim: false});
          doc.image(__dirname + pathToCertificateBackgroundImage, {fit: [595, 842]});
          doc.fontSize(25).fillColor('black').text(participant.firstname.replace(/\|/g, '\n') + ' ' + participant.lastname.substring(0, 30), 0, 300, {align: 'center'});
          doc.fontSize(15).fillColor('black').text('Team', 0, 450, {align: 'center'});
          doc.fontSize(35).fillColor('black').text(participant.team.substring(0, 60), 0, 465, {align: 'center'});
          doc.fontSize(15).fillColor('black').text('Zeit', 0, 515, {align: 'center'});
          doc.fontSize(30).fillColor('black').text(timestring, 0, 530, {align: 'center'});
          doc.fontSize(15).fillColor('black').text('Platz gesamt', 0, 580, {align: 'center'});
          doc.fontSize(40).fillColor('black').text(rank, 0, 600, {align: 'center'});
          doc.fontSize(15).fillColor('black').text('Platz ('+ participant.category + ')', 0, 640, {align: 'center'});
          doc.fontSize(40).fillColor('black').text(category_rank, 0, 660, {align: 'center'});
          deferred.resolve();
        }
        ;
      });
    });
  });
  return deferred.promise;
};

pdfGeneration.generateCertificateDownload = (res, doc, startnumber) => {
  const deferred = Q.defer();
  participants.get.byStartnumber(startnumber).then(participant => {
    pdfGeneration.createCertificatePage(doc, participant)
      .then(() => {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': 'attachment; filename=' + 'urkunde.pdf'
        });
        doc.pipe(res);
        doc.end();
        deferred.resolve(doc);
      }).catch(deferred.reject);
  }).catch(deferred.reject);
  return deferred.promise;
};

pdfGeneration.generateCertificate = (res, startnumber) => {
  let doc = new PDFDocument({size: 'A4', margin: 0});
  return pdfGeneration.generateCertificateDownload(res, doc, startnumber);
};

module.exports = pdfGeneration;
