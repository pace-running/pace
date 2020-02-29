/* jshint node: true */
'use strict';

const router = require('express').Router();
const multiparty = require('multiparty');
const isAuthenticated = require('../../acl/authentication');
const race = require('../../service/race');
const startblocks = require('../../service/startblocks');
//TODO Rename the whole file  -> Race? Results?
router.get('/', isAuthenticated, (req, res) => {
            startblocks.get()
              .then((blocks) => {
                res.render('admin/after', {
                  isAdmin: true,
                  blocks: blocks,
                  csrf: req.csrfToken()
                });
              });
});

router.post('/', isAuthenticated, (req, res) => {
  startblocks.save(req.body);
  res.redirect('/admin/after');
});

router.post('/import', isAuthenticated, (req, res) => {
  const form = new multiparty.Form();
  form.parse(req);
  form.on('file', function (name, file) {
    race.import(file.path);
  });
  form.on('close', function () {
    res.redirect('/admin/after');
  });
  form.on('error', function (err) {
    console.log(err);
  });
});


module.exports = router;
