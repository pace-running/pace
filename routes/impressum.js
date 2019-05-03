/* jshint node: true */
'use strict';


const router = require('express').Router();

router.get('/', (req, res) =>
  res.render('impressum', {})
);

module.exports = router;
