/* jshint node: true */
'use strict';

const router = require('express').Router();
const bankstatement = require('../../service/bankStatement')
const payments = require('../../service/payments');
const multiparty = require('multiparty');
const isAuthenticated = require('../../acl/authentication');
router.get('/', isAuthenticated, (req, res) => {
                res.render('admin/paymentProcessing', {
                  isAdmin: true,
                  csrf: req.csrfToken()
              });
});

router.post('/import', isAuthenticated, (req, res) => {
  const form = new multiparty.Form();
  form.parse(req);
  form.on('file', function (name, file) {
    bankstatement.parse(file)
      .then((reasons) => {
        payments.validate(reasons)
          .then((result) => {
            res.send(result);
          })
    })
  });
  form.on('error', function (err) {
    console.log(err);
  });
});


module.exports = router;
