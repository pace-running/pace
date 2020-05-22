/* jshint node: true */
'use strict';
const _ = require('lodash');
const nodemailer = require('nodemailer');
const config = require('config');
const pug = require('pug');

const editUrlHelper = require('../../domain/editUrlHelper');

let service = {};
service._nodemailer = nodemailer;

service.sendStatusEmail = (participant, subject, pugfile) => {
  pug.renderFile(pugfile,
    {name: participant.firstname,
      startnumber: participant.start_number,
      editUrl: editUrlHelper.generateUrl(participant.secureid),
      pdfUrl: editUrlHelper.generateStartnumberDownloadUrl(participant.start_number)},
    (error, html) =>
      service.sendEmail(participant.email, subject, html, error)
  );
};

service.sendEmail = (address, subject, text, error) => {
  if  (!_.isEmpty(address)) {
    if (error) {
      console.error(error);
    } else {
      let poolConfig = config.get("mailserver")
      let transporter = service._nodemailer.createTransport(poolConfig);
      return transporter.sendMail({
        from: config.get('contact.email'),
        to: address,
        subject: subject,
        html: text
      });
    }
  }
};

module.exports = service;
