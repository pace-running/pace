/* jshint node: true */
'use strict';

const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('results/teamlist');
});

module.exports = router;
