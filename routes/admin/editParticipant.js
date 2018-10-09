/* jshint node: true */
'use strict';

const router = require('express').Router();
const config = require('config');
const participants = require('../../service/participants');
const participant = require('../../domain/participant');
const isAdmin = require('../../acl/authentication');

router.get('/:secureId', isAdmin, (req, res) => {
  const participantId = req.params.secureId;
    participants.get.bySecureId(participantId)
      .then(p => res.render('admin/participants/editParticipant', {participant: p, participantid: participantId, teamEvent: config.get('teamEvent'), isAdmin: true}))
      .catch(() =>
        res.render('error', {
          message: "Teilnehmer nicht bekannt",
          error: {status: "Möglicherweise wurde ein falscher Link verwendet"}
        })
      );
});

router.post('/', isAdmin, (req, res) => {
  participants.update(participant.from(req.body), req.body.participantid)
    .then(() => { participants.setSeconds(req.body.seconds, req.body.participantid)})
    .then(() => res.redirect('/admin/participants'))
    .catch(() => res.render('error', {
      message: "Es ist ein Fehler aufgetreten",
      error: {status: "Bitte versuche es nochmal"}
    }));
});

router.post('/delete', isAdmin, (req, res) => {
    participants.delete(req.body.participantid)
      .then(() => res.redirect('/admin/participants'))
      .catch(() => res.render('error', {
        message: "Es ist ein Fehler aufgetreten",
        error: {status: "Bitte versuche es nochmal"}
      }));

});

module.exports = router;
