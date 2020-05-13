/* jshint node: true */
'use strict';

const router = require('express').Router();
const _ = require('lodash');
const pdfGeneration = require('../pdf/pdfGeneration');
const config = require('config');

router.get('/startnumbers', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment');
  res.setHeader('Content-disposition', 'attachment; filename=startnumbers.zip');
  res.setHeader('Content-type', 'application/zip');
  pdfGeneration.zip(res);
});

module.exports = router;

router.get('/startnumber/:number', (req,res) => {
  res.setHeader('Content-Disposition', 'attachment');
  res.setHeader('Content-disposition', 'attachment; filename=startnumber.pdf');
  res.setHeader('Content-type', 'application/pdf');
  let filepath = config.get('pdfPath') + req.params.number + '.pdf';
  res.download(filepath)
})
