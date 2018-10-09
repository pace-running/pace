/* jshint node: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');

router.get('/:secureId', (req, res) => {
  const secureId = req.params.secureId;
    participants.confirm_result(secureId)
      .then(p => res.render('participants/confirmResult', {participant: p}))
      .catch((err) =>
        res.render('error', {
          message: "Teilnehmer nicht bekannt",
          error: {status: err}
        })
      );
});
module.exports = router;
