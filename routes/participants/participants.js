/* jshint node: true */
'use strict';

const router = require('express').Router();

let useDefaultAuthentication = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    let user = {
      username: 'guest',
      role: 'guest'
    };
    req.logIn(user, next);
  }
};

router.get('/', useDefaultAuthentication, (req, res) => {
  res.render('participants/list');

});

module.exports = router;
