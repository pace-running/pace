/* jshint node: true */
'use strict';

const router = require('express').Router();
const config = require('config');
const participants = require('../../service/participants');
const editUrlHelper = require('../../domain/editUrlHelper');
const participant = require('../../domain/participant');

router.get('/:secureId', (req, res) => {
  const participantId = req.params.secureId;
    participants.get.bySecureId(participantId)
      .then(p => res.render('participants/editParticipant', {participant: p,
                                                             participantid: participantId,
                                                             teamEvent: config.get('teamEvent'),
                                                             pdfUrl: editUrlHelper.generateStartnumberDownloadUrl(p.start_number)}
      ))
      .catch(() =>
        res.render('error', {
          message: "Teilnehmer nicht bekannt",
          error: {status: "Möglicherweise wurde ein falscher Link verwendet"}
        })
      );
});

router.post('/', (req, res) => {
  const currentParticipant = participant.from(req.body);
  const id = req.body.participantid;
  participants.update(currentParticipant, id)
    .then(() => res.render('participants/success', {name: req.body.firstname + ' ' + req.body.lastname}))
    .catch(() => res.render('error', {message: "Es ist ein Fehler aufgetreten", error: {status: "Bitte versuche es nochmal"}}));
});

module.exports = router;
