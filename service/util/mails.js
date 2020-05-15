/* jshint node: true */
'use strict';
const _ = require('lodash');
const nodemailer = require('nodemailer');
const config = require('config');
const pug = require('pug');
const Q = require('q');

const editUrlHelper = require('../../domain/editUrlHelper');

let service = {};
service._nodemailer = nodemailer;

service.sendStatusEmail = (participant, subject, pugfile) => {
  const deferred = Q.defer();
  pug.renderFile(pugfile,
    {name: participant.firstname, startnumber: participant.start_number,  editUrl: editUrlHelper.generateUrl(participant.secureid)},
    (error, html) =>
      service.sendEmail(participant.email, subject, html, error)
        .then(() => { deferred.resolve(); })
        .catch(() => { deferred.reject(); })
  );
  return deferred.promise;
};

service.sendEmail = (address, subject, text, error) => {
  const deferred = Q.defer();
  if  (!_.isEmpty(address)) {
    if (error) {
      deferred.reject(error);
    } else {
      let poolConfig = config.get("mailserver")
      let transporter = service._nodemailer.createTransport(poolConfig);
      transporter.sendMail({
        from: config.get('contact.email'),
        to: address,
        subject: subject,
        html: text
      }).then(() => { deferred.resolve();});
    }
  }
  return deferred.promise;
};

module.exports = service;
